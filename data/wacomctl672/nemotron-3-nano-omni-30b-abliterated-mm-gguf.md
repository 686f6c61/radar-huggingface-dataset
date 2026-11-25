# wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF

## Resumen

Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF es una distribución en formato GGUF del modelo multimodal divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16, que a su vez deriva de la familia Nemotron 3 Nano de NVIDIA. El repositorio lo publica el usuario wacomctl672 y su función es ofrecer versiones cuantizadas listas para ejecutarse en llama.cpp, incluyendo el soporte multimodal mediante un proyector mmproj separado. El modelo cuenta con 31.577.940.288 parámetros totales según los pesos en safetensors del modelo base.

La característica definitoria de esta variante es su condición de "abliterated": se han modificado o eliminado los vectores de rechazo y las mitigaciones de seguridad del modelo original, de modo que el modelo puede producir contenido sin filtrar. Esto lo sitúa en el ámbito de la investigación y la evaluación por desarrolladores, no en el de aplicaciones comerciales sensibles sin supervisión. La licencia aplicable sigue siendo el NVIDIA Open Model Agreement, lo que impone restricciones y responsabilidades adicionales al usuario.

El repositorio tiene un tamaño de 58,1 GB y acumula 277 descargas y 2 likes en el momento de la consulta. No se dispone de información publicada sobre idiomas soportados, pipeline ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 31.577.940.288 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (6,21 BPW por cuantización de respaldo) y Q8_0 (8,51 BPW) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en bf16 |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, uso de mezcla de expertos, mecanismos de atención o componentes multimodales más allá de la existencia de un proyector mmproj). El nombre del modelo base de referencia de NVIDIA incluye el sufijo "A3B", que en la convención de nomenclatura de Nemotron sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos, pero este dato no está confirmado en la documentación disponible y no debe tomarse como verificado.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF, DPO) ni innovaciones técnicas específicas. Lo único verificable es que el repositorio contiene conversiones cuantizadas del modelo bf16 original, probadas con el proyector multimodal Q8_0 publicado por ggml-org para la variante NVIDIA-Nemotron-3-Nano-Omni-30B-A3B, y que el autor indica funcionamiento bajo llama.cpp con CUDA en Windows.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: el autor confirma haber probado la multimodalidad con el mmproj Q8_0 de ggml-org, lo que habilita entrada de imágenes junto con texto.
- Ejecución local mediante llama.cpp, con compatibilidad declarada con cualquier plataforma que soporte dicho runtime.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Contenido sin filtros de rechazo: al estar abliterated, el modelo no aplica las mitigaciones de seguridad originales, lo que amplía el rango de respuestas generadas.
- No se dispone de información verificada sobre soporte de tool calling, razonamiento multi-paso, capacidades de código o matemáticas, ni cobertura multilingüe.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema con los vectores de rechazo eliminados, comparándolo con la versión original de NVIDIA para analizar qué respuestas cambian y por qué.
- Evaluación de cuantizaciones en local: sirve para medir la degradación de calidad entre Q4_K_M y Q8_0 en tareas multimodales, usando el mmproj Q8_0 como referencia.
- Despliegue en estaciones de trabajo con GPU de consumo: al estar en GGUF, puede ejecutarse en llama.cpp sobre Windows con CUDA, lo que facilita pruebas sin infraestructura de centro de datos.
- Prototipado de asistentes multimodales sin restricciones de contenido: útil en entornos de investigación donde se necesita explorar respuestas a prompts que el modelo original rechazaría.
- Generación de datos sintéticos para entrenamiento: el modelo puede producir corpus de texto diverso en pipelines internos, con revisión humana posterior obligatoria.
- Pruebas de robustez y red teaming: permite generar ataques y respuestas adversarias para evaluar filtros y clasificadores de seguridad propios.
- Integración en herramientas compatibles con endpoints: gracias a la etiqueta `endpoints_compatible`, puede conectarse a clientes que consuman APIs de inferencia locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 31.577.940.288 parámetros, la cuantización Q8_0 a 8,51 BPW requiere aproximadamente 33,6 GB solo para los pesos, más overhead de contexto y del proyector multimodal; la Q4_K_M a 6,21 BPW requiere aproximadamente 24,5 GB.
- GPU recomendadas: para Q8_0 se necesita una GPU con 40 GB o más (A100 40GB, A100 80GB, H100); para Q4_K_M, una GPU de 32 GB (V100 32GB, A100 40GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en Q4_K_M sin descarga parcial a RAM del sistema, lo que reduce drásticamente el throughput. Requiere al menos 32 GB de VRAM para una ejecución íntegra en GPU.
- Opciones de despliegue: llama.cpp es el runtime validado por el autor (probado en Windows con CUDA). No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF (este) | 31.577.940.288 | no disponible | GGUF | NVIDIA Open Model Agreement | Variante abliterated, multimodal con mmproj |
| divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16 | 31.577.940.288 (presumiblemente) | no disponible | bf16 | NVIDIA Open Model Agreement | Modelo base del que deriva esta cuantización |
| NVIDIA-Nemotron-3-Nano-Omni-30B-A3B (original) | no disponible | no disponible | safetensors / GGUF | NVIDIA Open Model Agreement | Versión con mitigaciones de seguridad intactas |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: las mitigaciones de seguridad y los vectores de rechazo han sido modificados o eliminados, por lo que puede generar contenido ofensivo, sesgado o sin filtrar. No es apto para producción orientada al público sin capas adicionales de moderación.
- Riesgo de alucinación: no cuantificado en la documentación, pero inherente a los modelos de lenguaje de esta escala; se recomienda verificación factual en cualquier uso.
- Licencia: el uso y la distribución están sujetos al NVIDIA Open Model Agreement, que impone condiciones de uso aceptable y responsabilidad legal sobre el usuario. La licencia del repositorio figura como "other" con nombre "nvidia-open-model-agreement".
- Idiomas: no se documenta cobertura lingüística, por lo que no puede asumirse un rendimiento multilingüe uniforme.
- Contexto: no se especifica la longitud de ventana, lo que impide planificar cargas de trabajo con documentos largos.
- Cuantización Q4_K_M: el autor advierte que su tamaño efectivo es de 6,21 BPW debido a cuantización de respaldo, lo que implica una calidad inferior a la esperada para ese nivel nominal.
- Ausencia de garantías: el uploader declara el modelo "as is", sin responsabilidad sobre daños, disputas legales o mal uso posterior.
- Verificación de integridad: al ser una conversión de terceros, conviene validar los pesos frente al modelo base antes de usos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wacomctl672/Nemotron-3-Nano-Omni-30B-Abliterated-MM-GGUF
- Modelo base bf16: https://huggingface.co/divinetribe/Nemotron-3-Nano-Omni-30B-Abliterated-MM-bf16
- Proyector multimodal Q8_0 de ggml-org: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-GGUF/blob/main/mmproj-NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Q8_0.gguf
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
