# wirkung/Origami-27B

## Resumen

Origami-27B es un artefacto de inferencia derivado de Qwen/Qwen3.5-27B, publicado por el autor wirkung bajo el identificador wirkung/Origami-27B. No se trata de un modelo entrenado desde cero ni de un fine-tuning: según la model card, es una compilación en forma cerrada (sin descenso de gradiente, sin pasos de entrenamiento) que pliega el checkpoint BF16 original de 55,56 GB en un bundle de 7,44 GB (ratio 7,46x) compuesto por 410 ficheros de operador `.o3f` más un `exact_core.safetensors`. La arquitectura subyacente es la de Qwen3.5-27B: 27,80B parámetros, 48 capas Gated DeltaNet, 16 capas de atención completa con 64 grupos KV, cabeza nativa de Multi-Token Prediction (MTP) y vocabulario de 248.320 entradas.

La propuesta técnica central es la ejecución de un modelo de 27,80B parámetros con 0 GB de VRAM dedicada y 0 GB de RAM de pesos, mapeando el fichero desde SSD/NVMe vía `mmap` del sistema operativo y manteniendo un estado de sesión constante de 34,24 MB independientemente de la longitud de contexto. El runtime es propio (`wirkung`, dependiente solo de `numpy`), con backend C11, NPU, `sGPU`, Metal y PTX, y elimina dependencias de PyTorch, vLLM, MLX y CUDA.

Es relevante ahora porque propone un contrato de ejecución cross-silicon con reducción entera diádica (`v3-exakt`) que, según el autor, produce reducciones canónicas idénticas en CPU (AVX2/NEON), NPU y GPU en lugar de aproximaciones de coma flotante. La release se etiqueta explícitamente como Preview: las cifras estructurales (footprint, ratios, invariantes de memoria constante) son propiedades fijas del artefacto, mientras que el throughput dependiente de hardware se omite de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa (64 grupos KV); HCGM (Holographic Causal Graph Machine) como artefacto compilado |
| Parámetros totales | 27,80B (topología idéntica al modelo base) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible como cifra explícita; se documenta estado constante hasta 1M tokens |
| Tipos de cuantización | no disponible (compresión por plegado espectral `.o3f`, no cuantización estándar) |
| Idiomas soportados | en, de |
| Licencia | wirkung-model-and-runtime-1.0 (etiquetada como `other`) |
| Formato de pesos | 410 ficheros `.o3f` + `exact_core.safetensors`; repo de 7,5 GB |
| Modelo base | Qwen/Qwen3.5-27B (relación: quantized) |
| Librería / runtime | `wirkung` (dependencias: `wirkung` + `numpy`) |
| Footprint en disco | 7,44 GB (7,33 GB y 7,57x sin MTP) |
| Estado de sesión | 34,24 MB constante O(1) a cualquier horizonte |
| VRAM requerida | 0 GB |
| RAM de pesos dedicada | 0 GB (mmap read-only desde SSD/NVMe) |

## Arquitectura y entrenamiento

El modelo preserva la arquitectura completa de Qwen3.5-27B: 48 bloques Gated DeltaNet, 16 bloques de atención completa con 64 grupos KV, cabeza MTP rescatada y vocabulario de 248.320 entradas. Sobre esa topología, el autor aplica una pipeline de compilación en cuatro etapas sin gradientes: (1) ejecución disk-resident mediante `mmap` read-only de páginas de operador bajo un contrato de reducción entera diádica (`v3-exakt`); (2) plegado espectral en forma cerrada a ficheros `.o3f` usando bitplanos `FWHT_128` con scrambling de Rademacher y cristales proyectivos de rango r (`U_r V_r^T`); (3) síntesis de estado constante mediante el motor interno Wirkung, con scans de monoide WY asociativo en las capas DeltaNet y acotación de los 64 grupos KV mediante un sink Token-0 fijado, una frontera exacta de 1.024 tokens y centroides de Ward centrados en clave; (4) readout certificado con puerta Cauchy-Schwarz en `lm_head` y verificación multi-fila vía MTP, que el autor reporta con 0 deriva en decodificación greedy.

No hay datos publicados sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO, porque el artefacto no se entrena: hereda el conocimiento del checkpoint base congelado. La innovación declarada es la reducción del estado vivo de 1,18 GiB (build `ConstantKV` de primera generación) a 34,24 MB en cualquier horizonte, y la eliminación de dependencias de PyTorch, vLLM, MLX y CUDA en favor de un runtime C11 standalone con backends NPU, `sGPU`, Metal y PTX.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-27B.
- Razonamiento y decodificación autoregresiva con verificación multi-token nativa (MTP) y 0 deriva reportada en trayectorias greedy.
- Ejecución con estado constante O(1) a horizontes arbitrarios (documentado de 4k a 1M tokens).
- Inferencia sin GPU: CPU (AVX2/NEON), NPU, `sGPU` (`cpu_cuda`), Apple Metal y PTX standalone.
- Ejecución disk-resident: el modelo se mapea desde SSD/NVMe sin cargar pesos en RAM ni VRAM.
- Capacidades multimodales: la etiqueta `multimodal` aparece en los tags del repositorio, aunque la model card no detalla modalidades concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y alemán según el campo `language`.

## Casos de uso

- Despliegue en nodos sin GPU: el modelo se ejecuta desde SSD con 0 GB de VRAM y 0 GB de RAM de pesos, lo que permite servir un modelo de 27,80B en servidores de CPU convencionales o en hardware embebido con NPU.
- Inferencia en portátiles y estaciones de trabajo con 16 GB: el bundle de 7,44 GB cabe en nodos consumer de 16 GB sin swap, según la model card, habilitando uso local de un modelo de 27,80B.
- Conversaciones de contexto muy largo con memoria acotada: el estado de sesión constante de 34,24 MB permite mantener sesiones de hasta 1M tokens sin crecimiento lineal de KV cache, adecuado para asistentes documentales o análisis de repositorios extensos.
- Procesamiento en el borde (edge) y dispositivos con NPU: el backend NPU y el contrato de reducción entera diádica permiten ejecutar el mismo artefacto en silicio heterogéneo sin kernels CUDA.
- Pipelines de CI/CD y entornos air-gapped: al depender solo de `wirkung` + `numpy` y ejecutarse desde un fichero binario inmutable, el artefacto es reproducible y desplegable sin stack de PyTorch ni CUDA.
- Evaluación de investigación sobre compilación sin reentrenamiento: útil para estudiar plegado espectral, estados constantes y decodificación especulativa con MTP sobre un checkpoint congelado.
- Servicio de texto en inglés y alemán: generación y resumen en ambos idiomas soportados, con la salvedad de que no se declaran otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de throughput dependientes de hardware se omiten y se remiten al paper de la familia Origami. Las únicas métricas publicadas son estructurales: compresión 7,46x (55,56 GB a 7,44 GB), estado constante de 34,24 MB, 0 GB de VRAM y 0 GB de RAM de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (ejecución disk-resident vía `mmap`).
- RAM de pesos dedicada: 0 GB; el estado de sesión ocupa 34,24 MB constantes.
- Almacenamiento: 7,44 GB en SSD/NVMe; se recomienda NVMe por la latencia de page-fault durante el mapeo.
- GPU recomendadas: no aplica como requisito; el autor menciona `sGPU` (`cpu_cuda`), Metal y PTX como backends opcionales.
- ¿Cabe en GPU consumer? El artefacto está diseñado para nodos de 16 GB sin swap, pero la ejecución no requiere GPU.
- Opciones de despliegue: runtime `wirkung` (`pip install -U wirkung`, `wkng pull`, `wkng run`); no se soportan vLLM, llama.cpp, Ollama ni TGI según la model card.
- Latencia y throughput: no disponibles; remitidos al paper.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM mínima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Origami-27B | 27,80B | no disponible (estado constante hasta 1M) | 0 GB | wirkung-model-and-runtime-1.0 | Hugging Face + PyPI `wirkung` |
| Qwen/Qwen3.5-27B (base) | 27,80B | no disponible | decenas de GB HBM (multi-tens) | según modelo base | Hugging Face |
| Builds `ConstantKV` de primera generación (tfwnotops) | no disponible | no disponible | no disponible | no disponible | huggingface.co/tfwnotops |

La comparación directa con alternativas de la misma categoría (modelos de ~27B ejecutables en CPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Release etiquetada como Preview: la estabilidad de la API del runtime `wirkung` y del formato `.o3f` no está garantizada.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni latencia que permitan validar la calidad frente al modelo base.
- Idiomas limitados a inglés y alemán; no se declara soporte de castellano.
- Licencia `wirkung-model-and-runtime-1.0` (etiquetada `other`): es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- Riesgo de alucinación: heredado del checkpoint base; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la model card.
- Dependencia de un runtime propietario y de un formato binario cerrado (`.o3f`), lo que dificulta la portabilidad a stacks estándar (Transformers, vLLM, llama.cpp).
- Las afirmaciones de "0 deriva greedy" y de reducciones idénticas cross-silicon son del autor y no han sido verificadas de forma independiente en la información disponible.
- El rendimiento real depende de la latencia de almacenamiento (page-faults sobre NVMe) y no se publican cifras de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/Origami-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper (PDF en el repo): paper/Wirkung_2026_Origami_HCGM.pdf
- DOI: https://doi.org/10.13140/RG.2.2.31826.72647
- Runtime en PyPI: https://pypi.org/project/wirkung/
- Sitio del autor: https://wirku.ng
- Repositorio de primera generación: https://huggingface.co/tfwnotops
- Contacto: contact@wirku.ng
