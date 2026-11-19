# xgirls/MOSS-Image-SFT-HaDeS-Intel-GGUF

## Resumen

MOSS-Image-SFT-HaDeS-Intel-GGUF es un paquete de inferencia para generación de imágenes texto-a-imagen (pipeline `text-to-image`) publicado por el usuario `xgirls` en Hugging Face. No es un modelo entrenado desde cero, sino una distribución empaquetada y cuantizada que combina varios artefactos: el checkpoint SFT de MOSS-Image de OpenMOSS, el adaptador HaDeS v0.6 en formato LoRA de rango dos de DeVilDoNia (ya fusionado en el denoiser), un encoder de texto Qwen3.5 9B cuantizado y un VAE FLUX.2 (o su variante TAEF2). El objetivo declarado es ejecutar generación de imágenes MOSS en cuatro pasos sobre Windows usando `stable-diffusion.cpp` con backend Vulkan, apuntando específicamente a GPUs Intel (probado en Arc B390, con Iris Xe como candidato para el perfil compacto).

La relevancia de este artefacto es de nicho pero concreta: ofrece un camino reproducible para desplegar un modelo de difusión moderno en hardware Intel integrado o de gama media, donde las pilas CUDA habituales no están disponibles. El repositorio incluye un runner (`run.py`), presets de configuración y un manifiesto de cuantización que fija hashes SHA-256 de los artefactos, lo que facilita la verificación de integridad. El tamaño total del repo es de 2,7 GB y el perfil `fused` descarga 7,04 GB de pesos y tokenizer, con un presupuesto de memoria de 8 GiB en `Vulkan0`.

El conteo de parámetros reportado en safetensors es de 5.082.308.624 (aproximadamente 5,08 mil millones), aunque conviene interpretarlo con cautela: en un pipeline texto-a-imagen ese total agrega denoiser, encoder de texto y VAE, y no equivale a los parámetros activos del denoiser por sí solo. La licencia es Apache 2.0. No hay información sobre idiomas soportados ni sobre benchmarks estándar de calidad de imagen (FID, CLIP score, etc.) en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen (MOSS-Image SFT) con encoder de texto Qwen3.5 9B y VAE FLUX.2 / TAEF2; denoiser con adaptador HaDeS v0.6 fusionado |
| Parametros totales | 5.082.308.624 (según safetensors del repo; agrega componentes del pipeline) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K (checkpoint fused de 2,70 GB), Q3_K_S para el encoder Qwen3.5 9B; se menciona un intento Q2 descartado por corrupción de la imagen |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con stable-diffusion.cpp); el checkpoint base se distribuye en BF16 y se convierte a Q3_K |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: parte del checkpoint SFT de MOSS-Image de OpenMOSS (en BF16, repackaging de Comfy-Org) y le aplica el adaptador HaDeS v0.6 de DeVilDoNia, que consiste en 72 actualizaciones LoRA de rango dos. El script `merge_hades.py` acumula cada actualización en FP32, escribe las matrices fusionadas de vuelta en BF16 y después convierte 168 matrices de proyección a Q3_K con `stable-diffusion.cpp` (commit 532d2c1); el resto de tensores conserva sus tipos originales. El manifiesto `quantization.json` fija los archivos de entrada, la regla de conversión y el hash del artefacto publicado.

El pipeline completo combina el denoiser MOSS-Image con un encoder de texto Qwen3.5 9B (GGUF de Unsloth) y un VAE FLUX.2, con la opción de usar TAEF2 (de madebyollin) para reducir el coste del decoder. La generación es de cuatro pasos, lo que sugiere destilación o un schedule de muestreo muy agresivo, aunque la model card no documenta el método de entrenamiento del modelo base ni los datos utilizados. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO; en un modelo de difusión esas métricas no aplican del mismo modo y no se reportan.

## Capacidades

- Generación de imágenes texto-a-imagen en cuatro pasos de muestreo.
- Renderizado de texto legible en la imagen: la model card reporta que el perfil `fused` generó "MOSS STUDIO" y "MADE LOCALLY" de forma legible a 384×384 y 512×512.
- Tres perfiles de despliegue: `fused` (checkpoint Q3_K con HaDeS ya fusionado, menor huella), `compact` (carga el adaptador por separado) y `standard` (VAE FLUX.2 completo y encoder de texto de mayor precisión).
- Benchmark integrado (`--benchmark`) que renderiza un zorro y un póster tipográfico con prompts y semillas fijas.
- Verificación de integridad de assets mediante SHA-256 y descarga automática del runtime fijado.
- Comprobación de que `Vulkan0` es un dispositivo Intel antes de ejecutar; el runner se detiene si no puede verificar la colocación de parámetros en GPU.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de imágenes en equipos Windows con GPU Intel Arc: el perfil `fused` permite obtener una primera imagen en 6,47 s a 384×384 y 8,00 s a 512×512 en una Arc B390, con repeticiones de 2,55 s y 4,57 s respectivamente, lo que lo hace viable para iteración interactiva en ese hardware.
- Prototipado de pósters y material gráfico con texto: la capacidad de renderizar tipografía legible a 512×512 lo hace adecuado para borradores de carteles, banners y mockups donde el texto es parte del contenido.
- Despliegue en portátiles con gráficos integrados Intel Iris Xe: el perfil `compact` está señalado como candidato para Iris Xe, aunque el autor advierte que velocidad, memoria, comportamiento del driver y calidad de imagen aún no se han medido en ese hardware.
- Pruebas de integración continua de pipelines de difusión: el runner descarga, verifica hashes y ejecuta benchmarks con prompts y semillas fijas, lo que permite comparar resultados entre versiones de driver o de `stable-diffusion.cpp`.
- Evaluación comparativa de cuantizaciones: el repo incluye manifiesto de cuantización y evidencia de que Q2 corrompe el póster mientras Q3 lo mantiene legible, lo que sirve como caso de estudio para decidir niveles de compresión en difusión.
- Generación de imágenes en entornos sin CUDA: al apoyarse en Vulkan y `stable-diffusion.cpp`, ofrece una alternativa para máquinas donde no hay GPU NVIDIA y no se quiere recurrir a CPU pura.
- Reproducción de investigación sobre fusionado de adaptadores: el script `merge_hades.py` documenta el proceso de fusión LoRA en FP32 con almacenamiento BF16 y cuantización posterior, útil para replicar la técnica con otros adaptadores.

## Benchmarks y rendimiento

Los únicos datos publicados son tiempos de inferencia en Intel Arc B390 (Windows 11, driver Intel 32.0.101.9033, `stable-diffusion.cpp` 532d2c1). No hay benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

| Perfil | Resolución | Primera imagen desde arranque del servidor | Imagen repetida | Asignación de runtime para parámetros |
|---|---:|---:|---:|---:|
| Fused | 384×384 | 6,47 s | 2,55 s | 5.887 MB Vulkan, 0 MB host |
| Fused | 512×512 | 8,00 s | 4,57 s | 5.887 MB Vulkan, 0 MB host |
| Compact | 512×512 | 13,92 s | 5,88 s | 5.887 MB Vulkan, 0 MB host |
| Standard | 512×512 | 16,11 s | 7,11 s | 7.946 MB Vulkan, 0 MB host |

Los tiempos excluyen descargas y comprobaciones de hash. La memoria de parámetros reportada por el runtime no incluye buffers de ejecución, sobrecarga del sistema ni asignaciones del driver. Las mediciones corresponden a dos prompts sobre la misma máquina Intel Cloud.

## Requisitos de hardware

- VRAM estimada: el perfil `fused` asigna 5.887 MB en Vulkan para parámetros; el perfil `standard` asigna 7.946 MB. El presupuesto de runtime declarado para el perfil `fused` es de 8 GiB en `Vulkan0`.
- GPU probada: Intel Arc B390 con Windows 11 y driver Intel 32.0.101.9033.
- GPU candidata sin validar: Intel Iris Xe, con el perfil `compact`.
- No se documenta soporte para A100, H100 ni RTX 4090; el paquete está orientado a Vulkan sobre Intel y no se ha validado en CUDA.
- Despliegue: `stable-diffusion.cpp` (commit 532d2c1) mediante el runner `run.py` incluido; requiere Python 3.10 o superior de 64 bits, `huggingface_hub` y un driver Intel con Vulkan.
- Descarga total del perfil `fused`: 7,04 GB de pesos y tokenizer; el repo ocupa 2,7 GB.
- Latencia y throughput: ver tabla de benchmarks; primera imagen entre 6,47 s y 16,11 s según perfil y resolución, repeticiones entre 2,55 s y 7,11 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xgirls/MOSS-Image-SFT-HaDeS-Intel-GGUF | 5.082.308.624 (pipeline agregado) | no disponible | 6,47-16,11 s primera imagen en Arc B390 | Apache 2.0 | GGUF para stable-diffusion.cpp |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| leejet/MOSS-Image-SFT-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF para stable-diffusion.cpp |
| DeVilDoNia/HaDeS-MOSS-Turbo | no disponible | no disponible | no disponible | no disponible | Hugging Face (adaptador LoRA) |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa de calidad entre estas variantes; la comparativa se limita a procedencia, formato y licencia.

## Limitaciones y advertencias

- El paquete está validado únicamente en Intel Arc B390 con Windows 11 y un driver concreto; el rendimiento en Iris Xe, otras GPUs Intel o Linux no está medido y el propio autor lo señala como pendiente.
- La cuantización Q2 completó la ejecución pero corrompió el póster tipográfico; el perfil de baja memoria empaquetado usa Q3, de modo que bajar más la precisión no es seguro.
- El runner se detiene si no puede verificar que `Vulkan0` es un dispositivo Intel; no es un paquete portable a otros backends sin modificaciones.
- No hay información sobre sesgos, calidad en rostros, anatomía, sesgos culturales o de género, ni sobre tasas de alucinación visual (artefactos, texto mal formado) más allá de la evidencia anecdótica de dos prompts.
- No se documentan idiomas soportados ni calidad multilingüe del encoder de texto; el encoder es Qwen3.5 9B, pero no se aportan evaluaciones.
- El conteo de parámetros de 5,08 mil millones agrega componentes del pipeline y no debe interpretarse como tamaño del denoiser ni como equivalente a un LLM de ese tamaño.
- La licencia Apache 2.0 se declara en el repo, pero los componentes de origen (MOSS-Image, HaDeS, Qwen3.5, TAEF2, VAE FLUX.2) pueden tener sus propias condiciones; conviene verificar cada upstream antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.
- El modelo base es un SFT de cuatro pasos; no se detalla el método de destilación ni la estabilidad del sampler, por lo que la reproducibilidad entre versiones de `stable-diffusion.cpp` puede variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/MOSS-Image-SFT-HaDeS-Intel-GGUF
- Modelo base MOSS-Image-SFT (OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- GGUFs independientes de MOSS-Image-SFT (leejet): https://huggingface.co/leejet/MOSS-Image-SFT-GGUF
- Adaptador HaDeS v0.6 (DeVilDoNia): https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Encoder Qwen3.5 9B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Repackaging BF16 y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image
- TAEF2 (madebyollin): https://huggingface.co/madebyollin/taef2
