# tiyuvta/GLM-5.3-Flash-NVFP4-B200-hybrid

## Resumen

GLM-5.3-Flash-NVFP4-B200-hybrid es una cuantización híbrida de precisión del modelo zai-org/GLM-5.3-Flash, creada por tiyuvta (Avifenesh) para ejecutarse en GPUs NVIDIA B200 (sm_100). El modelo base es un MoE híbrido con atención lineal y sparse, desarrollado por Z.AI, con 320B parámetros totales y 18B activos, entrenado sobre 30T tokens y con capacidades multimodales. Esta variante sigue la receta de cuantización "Puzzle Table 2" de NVIDIA Nemotron-Labs-3-Puzzle-75B-A9B, que asigna precisiones distintas por operador: NVFP4 para los GEMMs de expertos, FP8 para la atención lineal, FP32 para el router y BF16 para el resto. El resultado es un checkpoint de 189.1 GB en formato safetensors, que reduce drásticamente el tamaño del modelo BF16 original (656 GB) manteniendo la arquitectura y las capacidades de tool-calling. Es relevante porque permite desplegar un modelo de 320B en una sola GPU B200, algo inviable con el modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal y sparse |
| Parámetros totales | 184.302.984.030 (safetensors); 320B (modelo base) |
| Parámetros activos | 18B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4, FP8, FP32, BF16 (híbrido por operador) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE híbrido con 320B parámetros totales y 18B activos, entrenado sobre 30T tokens. Combina atención lineal y sparse para reducir los costes de contexto largo, e incorpora "Manifold-Constrained Hyper Connections" para mejorar el escalado. El checkpoint cuantizado reporta 184.302.984.030 parámetros en los safetensors, lo que representa el conteo de tensores almacenados. La cuantización de tiyuvta no modifica la arquitectura, pero asigna precisiones distintas a cada operador siguiendo la tabla 2 de NVIDIA Nemotron-Labs-3-Puzzle-75B-A9B: los GEMMs de expertos y MLP densos se cuantizan a NVFP4 con calibración max-calib, empaquetado K-inner y plano de escala Swizzle32x4x4; los seis GEMMs de atención lineal (KDA) se cuantizan a FP8 e4m3; el router se mantiene en FP32; y la atención MLA/DSA, el absorb y otros tensores se mantienen en BF16. El autor indica que no se aplicó rotación QuaRot ni Hadamard, y que el input_scale para W4A4 tensor-core está diferido (no incluido en este checkpoint). La herramienta utilizada es nvidia-modelopt 0.46.0 para la matemática NVFP4, y el motor de inferencia memra (Rust/CUDA) para el empaquetado y la ejecución.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Soporte de tool calling / function calling, según los tags del modelo.
- Soporte de agentes y razonamiento multi-paso, gracias a la arquitectura híbrida que reduce costes de contexto largo.
- El modelo base es multimodal según la documentación de Z.AI, pero este checkpoint cuantizado está diseñado para text-generation.
- No se han documentado capacidades específicas de visión o audio en este checkpoint.

## Casos de uso

1. **Inferencia en producción en NVIDIA B200**: El modelo ocupa 189.1 GB, lo que permite cargarlo en una GPU B200 de 192 GB. Es adecuado para servir un modelo de 320B parámetros (con 18B activos) en una sola GPU, reduciendo costes de infraestructura frente a los 656 GB del modelo BF16 original.
2. **Agentes con tool calling**: El modelo soporta tool-calling, lo que permite integrarlo en sistemas de agentes que necesitan llamar funciones externas, consultar APIs o ejecutar código. La arquitectura híbrida de atención lineal y sparse reduce el coste de contextos largos, útil en agentes con historiales extensos.
3. **Atención al cliente multilingüe**: Soporta inglés y chino, y es conversacional. Puede gestionar conversaciones multi-turno en estos idiomas, con tool-calling para consultar bases de conocimiento o sistemas de ticketing.
4. **Análisis de documentos largos**: La combinación de atención lineal y sparse está diseñada para reducir costes de contexto largo, lo que lo hace adecuado para resumir o analizar documentos extensos, como contratos, informes o transcripciones.
5. **Despliegue en hardware con memoria limitada**: La cuantización híbrida NVFP4 reduce el tamaño del modelo de 656 GB (BF16) a 189.1 GB, permitiendo su ejecución en GPUs con 192 GB de VRAM en lugar de requerir múltiples GPUs o memoria masiva.
6. **Investigación en cuantización de precisión mixta**: La receta sigue la tabla 2 de NVIDIA Nemotron-Labs-3-Puzzle, con una asignación de precisión por operador (NVFP4, FP8, FP32, BF16). Es útil para estudiar el impacto de la cuantización híbrida en modelos MoE y para validar nuevas técnicas de empaquetado y escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 189.1 GB para los pesos; se recomienda una GPU con 192 GB de VRAM.
- GPU recomendada: NVIDIA B200 (sm_100). La model card indica que no es para RTX PRO 6000 (sm_89).
