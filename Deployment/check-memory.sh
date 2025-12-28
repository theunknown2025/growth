#!/bin/bash

################################################################################
# Growth AI - Memory Check Script
# Checks system memory and swap status
################################################################################

echo "========================================="
echo "System Memory Check"
echo "========================================="
echo ""

echo "=== Memory Status ==="
free -h
echo ""

echo "=== Swap Status ==="
swapon --show
echo ""

echo "=== Disk Space ==="
df -h /
echo ""

echo "=== Memory Analysis ==="
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
SWAP_TOTAL=$(free -m | awk 'NR==3{print $2}')
SWAP_USED=$(free -m | awk 'NR==3{print $3}')

echo "Total RAM: ${TOTAL_MEM}MB"
echo "Available RAM: ${AVAILABLE_MEM}MB"
echo "Total Swap: ${SWAP_TOTAL}MB"
echo "Used Swap: ${SWAP_USED}MB"
echo ""

if [ "$AVAILABLE_MEM" -lt 512 ]; then
    echo "⚠️  WARNING: Low available memory (${AVAILABLE_MEM}MB)"
    echo "   Recommendation: Create swap space"
fi

if [ "$SWAP_TOTAL" -eq 0 ]; then
    echo "⚠️  WARNING: No swap space detected"
    echo "   Recommendation: Create 2GB swap file"
fi

echo ""
echo "=== Top Memory Consumers ==="
ps aux --sort=-%mem | head -6
echo ""

