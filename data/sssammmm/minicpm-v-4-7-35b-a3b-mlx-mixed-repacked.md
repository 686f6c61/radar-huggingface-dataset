# SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed-repacked

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo vision-lenguaje de tipo mezcla de expertos (MoE) desarrollado por OpenBMB, del que este repositorio es una redistribución de pesos en formato MLX realizada por el usuario SSSAMMMM. El modelo combina un codificador visual con un transformer de lenguaje MoE, y su nombre indica 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token. La ficha presente describe el checkpoint repaquetado, no el modelo original: los pesos aquí publicados son una conversión de precisión mixta a 4 bits para ejecución en Apple Silicon mediante MLX.

Este repositorio concreto no añade entrenamiento ni cuantización nueva: preserva los bytes de los tensores del checkpoint mixto original y los reorganiza en un layout propietario ("shared packed") consumido por el puente `shared_weights.py` / `les_weights.py` del proyecto Device-Cloud-Agent. No es un checkpoint estándar de mlx-vlm y no puede cargarse directamente con las herramientas habituales de MLX sin ese puente. Los pesos residentes se almacenan en ficheros `resident-*.safetensors`, mientras que cada fichero `experts-*.bin` contiene los registros de expertos de una capa, con un índice `les-index.json` que especifica offsets, formas, componentes de cuantización y sumas SHA-256.

Su relevancia es acotada pero específica: permite ejecutar un VLM MoE de 35B en hardware Apple con un consumo de memoria reducido gracias a la carga bajo demanda de expertos (modo LES) o a su ensamblado en buffers compartidos respaldados por DLPack (modo residente). Para el resto de usuarios, el punto de entrada recomendado es el modelo original de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con codificador visual (familia MiniCPM-V 4.7); layout MLX personalizado "shared packed" |
| Parametros totales | 3.000.621.104 según safetensors del repo; el nombre del modelo indica 35B-A3B (35B totales, ~3B activos), dato no verificado en este repo |
| Parametros activos | ~3B según nomenclatura A3B (no verificado en el repo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta (mixed precision), pesos repaquetados sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`resident-*.safetensors`), binarios de expertos (`experts-*.bin`), índice `les-index.json` con checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia MiniCPM-V 4.7 de OpenBMB y emplea una arquitectura de mezcla de expertos con un codificador visual acoplado a un transformer de lenguaje. El nombre 35B-A3B indica 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional por paso de decodificación a cambio de un mayor footprint de memoria. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO).

La innovación de este repositorio no está en el entrenamiento sino en el formato de almacenamiento. El layout v4 está pensado para que el puente de Device-Cloud-Agent lea expertos bajo demanda (modo LES) o los ensamble en buffers compartidos respaldados por DLPack (modo residente), usando los mismos ficheros en ambos modos. Los pesos del draft de decodificación especulativa (DSpark) se mantienen separados. El índice `les-index.json` describe offsets, formas, componentes de cuantización y checksums, y no contiene rutas locales ni depende de fechas de modificación de ficheros tras la descarga.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser un VLM de la familia MiniCPM-V, se espera soporte de entrada de imagen junto con texto; no confirmado explícitamente en la información disponible.
- Procesamiento de lenguaje natural y generación de código: capacidades propias de un LLM de 35B totales, no documentadas en este repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible; el repo no declara idiomas.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en este repositorio; consultar la model card de openbmb/MiniCPM-V-4.7-35B-A3B.

## Casos de uso

- Ejecución local de un VLM MoE en Apple Silicon: el layout MLX y la cuantización 4-bit mixta permiten cargar un modelo de 35B totales en equipos con memoria unificada limitada, usando carga de expertos bajo demanda mediante el puente LES.
- Investigación sobre decodificación especulativa: los pesos del draft DSpark se distribuyen por separado, lo que facilita experimentar con decodificación especulativa sobre el modelo principal sin tocar los pesos del target.
- Desarrollo de infraestructura de inferencia en MLX: el formato "shared packed" con índice de offsets y checksums sirve como referencia para implementar cargadores de pesos MoE personalizados.
- Reproducción de pipelines de Device-Cloud-Agent: el repo está diseñado específicamente para ese puente, por lo que es el artefacto adecuado para reproducir sus flujos de inferencia híbrida dispositivo-nube.
- Evaluación comparativa de cuantización mixta: al preservar los bytes del checkpoint mixto original, permite medir el impacto de la precisión mixta 4-bit frente a otras variantes del mismo modelo.
- Archivado y distribución de pesos para entornos sin acceso al checkpoint original: el repo mantiene los tensores cuantizados con verificación SHA-256, útil para despliegues con requisitos de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 16,8 GB, por lo que se necesita al menos esa cantidad de memoria más overhead de runtime; en modo residente el ensamblado de todos los expertos en buffers compartidos puede elevar el consumo por encima del tamaño del repo.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (M-series). No es un checkpoint utilizable directamente en CUDA sin conversión.
- Cabe en consumer GPU: no aplica en el sentido habitual; en Apple Silicon, equipos con 24 GB o 32 GB de memoria unificada son el objetivo razonable dado el tamaño del repo, aunque el modo residente puede requerir más.
- Opciones de despliegue: MLX con el puente `shared_weights.py` / `les_weights.py` de Device-Cloud-Agent; no es compatible como drop-in con mlx-vlm estándar. vLLM, llama.cpp, Ollama y TGI no soportan este layout.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed-repacked | 35B-A3B (3.000.621.104 según safetensors) | no disponible | MLX shared packed, 4-bit mixta | Apache 2.0 | Layout propietario, requiere puente LES |
| SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed | 35B-A3B | no disponible | MLX mixto | Apache 2.0 | Checkpoint fuente del repack |
| openbmb/MiniCPM-V-4.7-35B-A3B | 35B-A3B | no disponible | safetensors (upstream) | Apache 2.0 | Modelo original, formato estándar |

## Limitaciones y advertencias

- No es un checkpoint estándar de mlx-vlm: requiere el puente de Device-Cloud-Agent; las herramientas habituales de MLX no lo cargarán directamente.
- El layout "shared packed" es específico del proyecto y no está documentado fuera de la model card; la compatibilidad futura no está garantizada.
- El modo residente ensambla todos los expertos en memoria, lo que puede superar el tamaño del repo (16,8 GB) y agotar la memoria en equipos pequeños.
- Los pesos del draft DSpark se distribuyen por separado; sin ellos no se dispone de decodificación especulativa.
- No se declaran idiomas soportados ni límites de contexto en este repositorio; hay que remitirse al modelo original.
- No hay benchmarks publicados para este repack; el rendimiento depende de la implementación del puente y del hardware.
- Riesgo de alucinación y sesgos: propios del modelo original, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo upstream y de los datos de entrenamiento originales.
- El número de parámetros del safetensors (3.000.621.104) no cuadra con la nomenclatura 35B-A3B; posiblemente refleje solo un subconjunto de tensores o un conteo distinto; verificar antes de dimensionar hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed-repacked
- Checkpoint fuente del repack: https://huggingface.co/SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed
- Modelo upstream: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Árbol de ficheros del repo: https://huggingface.co/SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed-repacked/tree/main
