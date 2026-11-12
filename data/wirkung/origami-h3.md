# wirkung/Origami-H3

## Resumen

Origami-H3 es un modelo de generación de vídeo con audio (text-to-video, pipeline `text-to-video`) de 21.600 millones de parámetros publicado por el autor `wirkung` bajo el identificador `wirkung/Origami-H3`. No es un modelo entrenado desde cero: se presenta como una compilación en forma cerrada del checkpoint `MiniMax-H3` (arquitectura de Diffusion Transformer conjunto audio-vídeo) sin reentrenamiento, sin fine-tuning y sin pasos de gradiente. El autor lo describe como una "Holographic Causal Graph Machine (HCGM) Preview" que pliega el checkpoint original de 44,89 GB en BF16 a 10,38 GB (factor 4,33x) preservando la topología del grafo.

La propuesta técnica central es la ejecución residente en disco: los pesos se leen mediante `mmap` del sistema operativo desde SSD/NVMe, con 0 GB de VRAM de GPU dedicada y 0 GB de RAM dedicada a pesos, y un estado de sesión de complejidad constante O(1) a lo largo de ventanas audio-vídeo consecutivas. El autor afirma que el modelo se ejecuta en CPU, NPU, `sGPU`, Metal y PTX con un runtime propio (`wirkung` + `numpy`), eliminando dependencias de PyTorch, vLLM, MLX o CUDA.

Es relevante ahora porque propone una vía alternativa para desplegar un modelo de difusión de gran tamaño en hardware de consumo sin GPU de gama alta, a costa de sustituir el ecosistema estándar (Transformers, diffusers, vLLM) por un runtime propietario y un formato binario propio (`.o3f`). La información disponible es la model card del autor y los enlaces que esta contiene; no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) conjunto audio-vídeo; 50 bloques DiT, 2 token refiners, Turbo-LoRA Walsh-6 de rango 128, VAE 3D `SoL-H3` de 24 bloques y `Audio-VAE`; compilado como HCGM |
| Parámetros totales | 21,60B (21.600.000.000) |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible en tokens; el autor describe estado O(1) sobre ventanas audio-vídeo continuas sin corte |
| Tipos de cuantización | no disponible como cuantizaciones estándar (GGUF, AWQ, etc.); el artefacto usa reducción entera diádica `v3-exakt` y plegado en formato `.o3f` |
| Idiomas soportados | en, de |
| Licencia | `wirkung-model-and-runtime-1.0` (license: other) |
| Formato de pesos | `.o3f` (307 archivos de operadores DiT + VAE 3D/Audio) más `exact_core.safetensors`; checkpoint fuente en BF16 |

## Arquitectura y entrenamiento

Origami-H3 conserva la arquitectura del checkpoint fuente `MiniMax-H3`: 50 bloques de Diffusion Transformer conjuntos de audio y vídeo, 2 token refiners, un Turbo-LoRA Walsh-6 fusionado de rango 128, un VAE 3D `SoL-H3` de 24 bloques y un `Audio-VAE`. La generación se realiza mediante flow matching con Euler desplazado en 4 pasos, y el autor añade observadores `M-Rail` que verifican invariantes geométricos, físicos y audiovisuales en paralelo sobre el mismo flujo de pesos.

El entrenamiento declarado es nulo: 0 pasos de reentrenamiento, 0 de fine-tuning y 0 de gradiente. La transformación se realiza mediante un pipeline de compilación en cuatro partes: ejecución `mmap` residente en disco con reducción entera diádica `v3-exakt` (AVX2/NEON, NPU, `sGPU`, Metal, PTX); plegado en forma cerrada Parseval más cristales proyectivos (cristales de frontera de rango 48 en bloques 0..2 y 47..49, cristales interiores de rango 32 en bloques 3..46, QR-SVD con gauge balanceado y Turbo-LoRA `rANS`); síntesis de un estado de horizonte O(1) sin cortes de escena; y descomposición en línea de la trayectoria latente en estructura conocida de bajo rango más residuo. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset original de `MiniMax-H3`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio conjunto.
- Generación de audio sincronizado con el vídeo mediante el `Audio-VAE` y los bloques DiT conjuntos.
- Ejecución con estado constante O(1) sobre ventanas audio-vídeo continuas, sin reinicios por corte de escena.
- Inferencia sin GPU: CPU (AVX2/NEON), NPU, `sGPU` (`cpu_cuda`), Apple Metal y PTX.
- Ejecución con 0 GB de VRAM y 0 GB de RAM dedicada a pesos, leyendo desde SSD/NVMe por `mmap`.
- Verificación geométrica, física y audiovisual mediante observadores `M-Rail`.
- Idiomas: inglés y alemán.
- No se documentan en la información disponible tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni modo thinking.

## Casos de uso

- Generación de vídeo con audio en estaciones de trabajo sin GPU dedicada: el modelo se ejecuta desde SSD con 0 GB de VRAM, por lo que puede desplegarse en portátiles o servidores de CPU para producir clips cortos con audio sincronizado.
- Prototipado de vídeo publicitario en local: el flujo de 4 pasos con Euler desplazado y el estado O(1) permiten iterar sobre guiones en inglés o alemán sin depender de servicios en la nube.
- Previsualización de storyboards con audio: la generación conjunta de vídeo y audio en una sola pasada facilita producir borradores con banda sonora para revisión de dirección.
- Despliegue en hardware embebido o NPU: la reducción entera diádica `v3-exakt` y el runtime en C11 permiten ejecutar en NPUs y `sGPU` sin pila CUDA, útil en dispositivos con restricciones térmicas y de memoria.
- Generación de clips de duración extendida sin cortes: el estado de horizonte O(1) evita el crecimiento de buffers latentes, lo que resulta adecuado para secuencias continuas de varias ventanas.
- Archivado y distribución de modelos en medios con poco almacenamiento: el artefacto de 10,38 GB frente a los 44,89 GB del checkpoint BF16 reduce el coste de distribución y el espacio en disco de los nodos de inferencia.
- Investigación sobre plegado de pesos sin reentrenamiento: el formato `.o3f` y el pipeline de compilación en forma cerrada sirven como banco de pruebas para estudiar compresión estructural de DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de throughput dependientes del hardware se omiten y se remiten al paper de la familia Origami; no se proporcionan valores de MMLU, HumanEval, GSM8K, FVD, CLIP score ni métricas audiovisuales.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB de VRAM dedicada según el autor; los pesos se mapean desde disco con `mmap`.
- RAM dedicada a pesos: 0 GB según el autor; se requiere espacio en SSD/NVMe para el artefacto de 10,38 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); el autor indica que la GPU es opcional y que el modelo se ejecuta en CPU, NPU, `sGPU`, Metal y PTX.
- ¿Cabe en GPU de consumo? El autor afirma que preserva los campos de velocidad SwiGLU en hardware de consumo de 16 GB, aunque la ejecución por defecto no usa VRAM.
- Opciones de despliegue: runtime `wirkung` (PyPI) con `numpy`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card los omite y los remite al paper.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Origami-H3 | 21,60B | no disponible (estado O(1) sobre ventanas) | `wirkung-model-and-runtime-1.0` | `.o3f` + `exact_core.safetensors`, runtime `wirkung` | Hugging Face, preview |
| MiniMax-H3 (fuente) | 21,60B | no disponible | no disponible en la información proporcionada | BF16, 44,89 GB | Repositorio del autor base en GitHub |
| Alternativas de generación de vídeo con audio de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es una versión Preview: el propio autor la etiqueta como tal y no garantiza cifras de rendimiento dependientes del hardware.
- Solo admite inglés y alemán; no hay soporte documentado de otros idiomas, incluido el castellano.
- No se han publicado benchmarks, por lo que no es posible evaluar la calidad de generación frente al checkpoint fuente ni frente a alternativas.
- El formato `.o3f` y el runtime `wirkung` son propietarios y no estándar; no hay integración con Transformers, diffusers, vLLM ni llama.cpp, lo que limita su adopción en pipelines existentes.
- La licencia `wirkung-model-and-runtime-1.0` es de tipo "other": deben revisarse los términos del archivo `LICENSE` antes de cualquier uso comercial.
- El modelo no ha sido reentrenado; cualquier sesgo, riesgo de alucinación visual o artefacto del checkpoint `MiniMax-H3` original se hereda sin mitigación adicional documentada.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que reduce la evidencia externa sobre su funcionamiento en producción.
- El rendimiento real depende del almacenamiento: al ejecutarse por `mmap` desde SSD/NVMe, la latencia estará dominada por el ancho de banda del disco.
- No se documentan mecanismos de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para flujos agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/Origami-H3
- Paper: `paper/Wirkung_2026_Origami_HCGM.pdf` (incluido en el repositorio)
- DOI: https://doi.org/10.13140/RG.2.2.31826.72647
- Runtime en PyPI: https://pypi.org/project/wirkung/
- Sitio del autor: https://wirku.ng
- Pesos base (MiniMax-AI): https://github.com/MiniMax-AI
- Contacto: contact@wirku.ng
- Licencia: `LICENSE` en el repositorio
- Publicaciones previas del autor: https://huggingface.co/tfwnotops
