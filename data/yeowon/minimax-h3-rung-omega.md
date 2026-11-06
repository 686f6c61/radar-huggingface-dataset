# yeowon/MiniMax-H3-Rung-Omega

## Resumen

MiniMax-H3-Rung-Omega es un checkpoint cuantizado del modelo de difusión multimodal MiniMax-H3 FL2VA (First/Last-Frame-to-Video+Audio), desarrollado por el usuario independiente yeowon sobre el modelo base Comfy-Org/MiniMax-H3. El modelo original es un Diffusion Transformer de 33,1B parámetros totales con 20,11B activos, capaz de generar vídeo y audio estéreo sincronizado a partir de un primer y último fotograma de condicionamiento. Esta versión aplica una cuantización ternaria balanceada en base 3 ("Rung Omega") a las 200 capas lineales de los 50 bloques del DiT, reduciendo el peso de 37,46 GiB en BF16 a 14,98 GiB (5,977 bits por peso con compresión Joint-tANS), sin ninguna capa en fallback.

El interés de esta ficha reside en dos contribuciones técnicas: la cuantización de 4 trits en retícula balanceada base 3 con rango [-40, +40] y escalas FP16 por grupo de 128, y el motor de inferencia TheoremFlow-Omega, que acelera el muestreo de 20 pasos de 625,4 s a 70,11 s (8,92x) manteniendo una similitud coseno de latentes de vídeo del 99,58%. El resultado es un modelo de generación vídeo-audio que cabe en GPUs de consumo alto y que puede ejecutarse en ComfyUI.

La relevancia actual es doble: por un lado, demuestra que la cuantización agresiva por debajo de 6 bits puede superar a int8 en fidelidad de velocidad en modelos de difusión; por otro, el motor TheoremFlow-Omega reduce el coste de muestreo a un orden de magnitud asumible en producción. No obstante, se trata de un artefacto de investigación con licencia "other" y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multimodal vídeo+audio, 50 bloques |
| Parámetros totales | 33,1B (modelo base MiniMax-H3 FL2VA) |
| Parámetros activos | 20,11B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria balanceada base 3 (4 trits, base 243, 5 en 4 bytes), Joint-tANS; escalas FP16 con group_size=128 y convrot_groupsize=256 |
| Idiomas soportados | no disponible (el demo incluye voz en coreano) |
| Licencia | other |
| Formato de pesos | safetensors (checkpoint ComfyUI); repo de 17,4 GB |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 FL2VA es un Diffusion Transformer multimodal que combina generación de vídeo y audio estéreo en un único proceso de flow-matching. Toma como condicionamiento un primer y un último fotograma (First/Last-Frame-to-Video+Audio) y produce una secuencia de vídeo de 864×480 con 124 fotogramas a 24 fps junto con una pista de audio estéreo a 32 kHz. La variante aquí publicada no reentrena el modelo: aplica una cuantización post-entrenamiento sobre las 200 proyecciones lineales (attn.qkv_proj, attn.out_proj, mlp.fc1, mlp.fc2) de los 50 bloques DiT.

La innovación técnica principal es la retícula "Rung Omega" de 4 trits en base 3 balanceada, con valores en [-40, +40] y escalas FP16 por grupo de 128, más una rotación de convolución de grupo 256. El checkpoint usa compresión Joint-tANS (5,977 BPW efectivos, 14,98 GiB) o codificación cruda base 243 (16,22 GiB). Sobre la inferencia, TheoremFlow-Omega implementa un esquema híbrido de 6 pasos exactos y 14 pasos rápidos con "floors" 1-5, que reduce el número efectivo de evaluaciones del modelo por paso. No se detallan los datos de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo a partir de primer y último fotograma (image-to-video condicionado).
- Generación conjunta de audio estéreo sincronizado con el vídeo, incluyendo voz y diálogo.
- Generación de vídeo a 864×480, 124 fotogramas, 24 fps, con audio a 32 kHz.
- Muestreo por flow-matching con 20 pasos estándar o esquema acelerado TheoremFlow-Omega.
- Ejecución en ComfyUI mediante el pipeline image-to-video.
- Cuantización ternaria de 4 trits con fidelidad de velocidad medida frente al profesor BF16.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de difusión, no un LLM.

## Casos de uso

- Previsualización rápida de vídeo generativo: con TheoremFlow-Omega, un clip de 124 fotogramas y audio se obtiene en unos 70 s, lo que permite iterar sobre guiones gráficos y condicionamientos de primer/último fotograma en sesiones de diseño.
- Generación de vídeo con audio sincronizado para prototipos publicitarios: el modelo produce voz y diálogo alineados con el movimiento, útil para maquetas de anuncios antes de la producción final.
- Interpolación de fotogramas clave en postproducción: dado un fotograma inicial y uno final, el modelo rellena la secuencia intermedia con movimiento y audio coherentes, reduciendo trabajo manual de animación.
- Creación de contenido para redes sociales en GPU de consumo: al ocupar 14,98 GiB en Joint-tANS, cabe en GPUs de 24 GB y permite generar clips cortos en estaciones de trabajo locales.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible para comparar esquemas ternarios base 3 frente a int8 y NVFP4 en tareas multimodales.
- Evaluación de motores de aceleración de muestreo: TheoremFlow-Omega puede compararse contra samplers estándar en pipelines de ComfyUI para medir el compromiso entre velocidad y fidelidad de latentes.
- Docencia y demostraciones de flow-matching multimodal: el par vídeo+audio sincronizado permite ilustrar la generación conjunta en cursos de difusión.

## Benchmarks y rendimiento

Resultados publicados por el autor (fidelidad de velocidad frente al profesor BF16, trayectorias retenidas de vídeo+audio+texto+keyframe, sigma en [0,08; 0,92]):

| Modelo / formato | Capas lineales activas | BPW efectivo | Tamaño total (GiB) | Compresión vs BF16 | Top-1 espacial vídeo | Top-1 audio | Coseno velocidad vídeo | Coseno velocidad audio | R² vídeo | R² audio |
|---|---|---|---|---|---|---|---|---|---|---|
| BF16 Teacher | 200 × BF16 | 16,000 | 37,46 | 1,00x | 100,00% | 100,00% | 1,000000 | 1,000000 | 100,00% | 100,00% |
| int8_convrot oficial | 200 × INT8 | 8,003 | 19,53 | 1,92x | 72,92% | 77,60% | 0,980832 | 0,985771 | 96,16% | 97,10% |
| Rung Omega (este) | 200 × 4-Trit base 243 | 5,967 (6,40 crudo) | 14,96 (16,22 crudo) | 2,50x | 78,12% | 81,77% | 0,976383 | 0,982006 | 95,28% | 96,43% |

Escalera Pareto multi-track (calibración de 10 bloques y benchmark retenido):

| Track | Trits / códec | BPW (Joint-tANS) | Tamaño (GiB) | Compresión vs BF16 | Top-1 combinado | SNR combinada (dB) | Coseno vídeo | Coseno audio |
|---|---|---|---|---|---|---|---|---|
| baseline_nvfp4_rtn | NVFP4 | 4,500 | 11,67 | 3,21x | 97,53% | 33,61 | 0,999810 | 0,999676 |
| omega_base15_ultra | 3-Trit [-7..+7] | 3,432 | 9,27 | 4,04x | 99,48% | 44,31 | 0,999984 | 0,999968 |
| omega_4trit_sub45 | 4-Trit ECSQ [-40..+40] | 4,488 | 11,64 | 3,22x | 99,48% | 47,77 | 0,999992 | 0,999990 |
| omega_4trit_pareto (publicado) | 4-Trit [-40..+40] | 5,977 | 14,98 (16,22 crudo) | 2,50x | 99,87% | 50,62 | 0,999995 | 0,999996 |
| omega_5trit_supreme | 5-Trit [-121..+121] | 7,575 | 18,57 | 2,02x | 99,48% | 52,60 | 0,999997 | 0,999998 |

Aceleración de inferencia TheoremFlow-Omega (864×480, 124 fotogramas + audio estéreo, 20 pasos):

| Motor / schedule | Tiempo de muestreo | Aceleración | Coseno latente vídeo | SNR latente vídeo | Coseno latente audio |
|---|---|---|---|---|---|
| 20 pasos estándar, 50 bloques | 625,40 s | 1,00x | 1,000000 | infinito | 1,000000 |
| TheoremFlow-Omega (6 exactos + 14 rápidos, floors 1-5) | 70,11 s | 8,92x | 0,995812 | 20,80 dB | 0,971400 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; estos no aplican a un modelo de difusión vídeo-audio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GiB para los pesos en Joint-tANS (14,98 GiB) o base 243 cruda (16,22 GiB), más overhead de activaciones y del VAE/decoder de vídeo y audio.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opción de consumo alto.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más; en 16 GB requeriría cuantizaciones adicionales o descarga de módulos no documentada.
- Opciones de despliegue: ComfyUI (librería declarada), con el motor TheoremFlow-Omega para el muestreo acelerado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: 70,11 s por clip de 124 fotogramas a 864×480 con audio (20 pasos, TheoremFlow-Omega) frente a 625,40 s del muestreo estándar, según datos del autor; no se especifica el hardware usado para estas mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Rung-Omega (este) | 33,1B totales / 20,11B activos | vídeo 864×480, 124 frames, audio 32 kHz | 4-Trit base 3 (5,977 BPW) | other | Hugging Face, ComfyUI |
| MiniMax-H3 FL2VA BF16 (base) | 33,1B totales / 20,11B activos | vídeo 864×480, 124 frames, audio 32 kHz | BF16 (16 BPW) | no disponible | Comfy-Org/MiniMax-H3 |
| MiniMax-H3 int8_convrot | 33,1B totales / 20,11B activos | vídeo 864×480, 124 frames, audio 32 kHz | INT8 (8,003 BPW) | no disponible | recomendado oficialmente |
| MiniMax-H3 NVFP4 RTN (track) | 33,1B totales / 20,11B activos | vídeo 864×480, 124 frames, audio 32 kHz | NVFP4 (4,5 BPW) | no disponible | variante de calibración |

No se dispone de comparación con otros modelos de generación vídeo-audio de terceros en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es imprescindible revisar las condiciones del modelo base Comfy-Org/MiniMax-H3 antes de cualquier uso comercial.
- Sesgos conocidos: no documentados por el autor; al ser un modelo de difusión vídeo-audio, puede reproducir sesgos de representación y de voz presentes en los datos del modelo base.
- Riesgo de alucinación visual y sonora: la generación de movimiento y audio no verificados puede producir artefactos, incoherencias de movimiento o diálogos no solicitados.
- Fidelidad de cuantización: la similitud coseno de velocidad es alta (0,976-0,982), pero el Top-1 espacial de vídeo cae al 78,12% frente al profesor BF16; en producción conviene validar la calidad perceptual.
- Aceleración TheoremFlow-Omega: la SNR de latentes de vídeo es de 20,80 dB y el coseno de audio baja a 0,9714; puede degradar la calidad en escenas complejas.
- Contexto e idiomas: no disponibles; el único demo publicado incluye voz en coreano, sin garantía de cobertura multilingüe.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de la comunidad.
- Ejecución limitada a ComfyUI: no hay soporte documentado para otros runtimes, lo que restringe su integración en pipelines de producción existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/MiniMax-H3-Rung-Omega
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Apoyo al autor: https://buymeacoffee.com/tripleyoung
- Demo de vídeo y audio (referencias dentro del repo): ./assets/MiniMax_H3_TheoremFlow_Omega_Champion.mp4, ./assets/MiniMax_H3_Rung_Omega_50blk_Champion.mp4, ./assets/MiniMax_H3_TheoremFlow_Omega_Champion_audio.wav
- Previsualización de fotogramas clave: ./assets/MiniMax_H3_TheoremFlow_Omega_Champion_keyframes.png
