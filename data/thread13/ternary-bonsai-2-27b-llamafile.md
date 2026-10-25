# thread13/Ternary-Bonsai-2-27B-llamafile

## Resumen

Ternary-Bonsai-2-27B-llamafile es un empaquetado en formato llamafile del modelo Ternary-Bonsai-2-27B, un modelo de 27 000 millones de parámetros (según el nombre del repositorio) cuantizado en formato ternario de 2 bits (Q2_0). Lo publica el usuario thread13 sobre los pesos GGUF de prism-ml (repositorio `prism-ml/Ternary-Bonsai-2-27B-gguf-dev`), y su interés principal no está en el modelo en sí, sino en el formato de distribución: un único ejecutable APE (Actually Portable Executable) que integra binarios de llama.cpp, los pesos y una interfaz de consola y web, de modo que el modelo se puede ejecutar sin instalar nada.

El pipeline declarado es image-text-to-text, y la model card referencia un fichero `mmproj` del repositorio base, lo que indica soporte multimodal de imagen y texto. Las etiquetas incluyen `qwen35`, y la model card enlaza la documentación de Qwen3.5 de Unsloth para ajustes de muestreo y modo thinking, por lo que la arquitectura subyacente parece derivar de Qwen3.5, aunque la model card no lo confirma de forma explícita.

Es relevante ahora porque ejemplifica una tendencia concreta: modelos de decenas de miles de millones de parámetros comprimidos a 2 bits ternarios para caber en hardware de consumo (el repositorio ocupa 8,3 GB) y distribuidos como binario único. Al mismo tiempo, es un artefacto de terceros con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, lo que exige cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; las etiquetas (`qwen35`) apuntan a una base Qwen3.5, sin confirmación explícita |
| Parametros totales | 27B según el nombre del modelo; no confirmado en la model card |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible como máximo; los ejemplos de la model card usan `--ctx-size 16384` |
| Tipos de cuantizacion | Ternaria de 2 bits (etiqueta `ternary-bonsai-2-27b-q2_0`); pesos en GGUF dentro del ejecutable |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | llamafile (APE, ejecutable único) con GGUF embebido; repositorio base en GGUF + fichero `mmproj` |
| Tamano del repositorio | 8,3 GB |
| Modalidad | image-text-to-text (multimodal imagen + texto) |
| Version de llamafile | 0.10 (nota `llamafile-0.10`) |
| Interfaz de ejecucion | Consola (`--chat`), servidor web (`--server`), CLI de completado (`--cli`) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf-dev |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento. El autor del empaquetado no entrena ni afina el modelo: toma los pesos GGUF publicados por prism-ml y los integra en un ejecutable llamafile construido sobre binarios de llama.cpp. La unica innovacion tecnica documentada es, por tanto, de empaquetado y despliegue, no de modelado.

Los indicios indirectos son tres. Primero, el nombre del modelo y la etiqueta `qwen35` sugieren una base de la familia Qwen3.5, y la model card remite a la guia de Unsloth para Qwen3.5 en lo relativo a plantilla de chat, modo thinking y parametros de muestreo. Segundo, la cuantizacion es ternaria de 2 bits (Q2_0), una compresion agresiva que reduce los pesos a valores de muy baja precision; a 27B esto se traduce en unos 6,75 GB teoricos solo de pesos, coherente con los 8,3 GB del repositorio una vez anadidos escalas, metadatos, `mmproj` y binarios. Tercero, la presencia del fichero `mmproj` en el repositorio base confirma un adaptador de proyeccion multimodal para entrada de imagen.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y el repositorio base publica un fichero `mmproj`.
- Modo thinking o razonamiento extendido, activable con `--chat-template-kwargs '{"enable_thinking":true}'`, segun la model card.
- Generacion de codigo, con parametros de muestreo recomendados especificamente para codigo en modo thinking (temperatura 0,6; top-p 0,95; top-k 20; min-p 0,0).
- Razonamiento general, con ajustes recomendados distintos (temperatura 1,0; top-p 0,95; top-k 20; min-p 0,0).
- Ejecucion autonoma como servidor HTTP local con interfaz web de chat, ademas de consola interactiva y CLI de completado.
- Capacidad de funcionar sin conexion y sin instalacion de dependencias, al ser un binario unico multiplataforma.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni otros idiomas distintos de los que herede el modelo base (no especificados).

## Casos de uso

- Evaluacion rapida en local de un modelo de 27B cuantizado a 2 bits: el ejecutable unico permite lanzar el modelo con `./Ternary-Bonsai-2-27B-Q2_0.llamafile` y medir calidad frente a cuantizaciones mayores, sin montar entornos de Python ni descargar dependencias.
- Despliegue en entornos aislados o air-gapped: al incorporar binarios y pesos en un solo fichero, se puede transferir por USB a una maquina sin acceso a internet y arrancar el servidor de chat en el puerto local.
- Asistente de razonamiento en portatiles sin GPU dedicada: con pesos ternarios de 2 bits, el modelo puede ejecutarse en CPU con un consumo de memoria del orden del tamano del repositorio, adecuado para pruebas de concepto y uso personal.
- Analisis de imagenes y documentos escaneados en local: el pipeline image-text-to-text y el `mmproj` permiten adjuntar capturas o fotos en el chat web y obtener descripciones o extraccion de informacion sin enviar datos a la nube.
- Generacion de codigo en modo thinking dentro de un flujo de trabajo de escritorio: activando `enable_thinking` y los parametros recomendados, se puede usar como asistente de programacion offline para tareas de refactorizacion o explicacion de fragmentos.
- Distribucion de demos a usuarios no tecnicos en Windows: el autor publica el binario como `.exe` precisamente para simplificar la ejecucion, lo que facilita entregar una demo funcional a alguien que solo sabe hacer doble clic.
- Pruebas de concepto de cuantizacion ternaria para equipos de infraestructura: sirve para medir el impacto real de Q2_0 en la calidad de salida antes de decidir si merece la pena adoptar variantes ternarias en un pipeline de edge computing.
- Docencia y talleres: un unico fichero ejecutable reduce el tiempo de puesta en marcha de un ejercicio practico sobre inferencia local de LLM y sobre modos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor del empaquetado no realiza mediciones propias. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ternarios de 2 bits de un modelo de 27B ocupan del orden de 6,75 a 8,3 GB (estimacion derivada del tamano del repositorio, 8,3 GB, que incluye pesos, `mmproj` y binarios). Habria que sumar la cache KV, que crece con el contexto; a 16 384 tokens el total podria situarse en la franja de 10 a 12 GB, aunque no hay mediciones publicadas.
- GPU de consumo: cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4090 24 GB. En tarjetas de 8 GB el margen es muy ajustado y dependera de la longitud de contexto.
- CPU: al ser un modelo ternario de baja huella, es viable en modo CPU con aproximadamente 10-12 GB de RAM libre; el rendimiento sera notablemente inferior al de GPU.
- Apple Silicon: los equipos con memoria unificada de 16 GB o mas son candidatos razonables, aunque no hay datos de rendimiento publicados.
- Opciones de despliegue: llamafile (incluido, version 0.10), llama.cpp usando el GGUF del repositorio base, y cualquier herramienta compatible con GGUF (LM Studio, Ollama) si acepta esta cuantizacion Q2_0 concreta. No se documenta soporte para vLLM ni TGI, que requieren pesos en safetensors o formatos propios.
- Latencia y throughput: no disponibles.
- Nota de seguridad: por defecto el servidor web escucha en todas las interfaces; hay que arrancarlo con `--host 127.0.0.1` para limitarlo a la maquina local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| thread13/Ternary-Bonsai-2-27B-llamafile | 27B (segun nombre) | No disponible (ejemplos a 16 384) | Ternaria 2 bits (Q2_0) | No disponible | llamafile (APE) con GGUF embebido | Empaquetado de terceros; 0 descargas y 0 likes en el momento de la consulta |
| prism-ml/Ternary-Bonsai-2-27B-gguf-dev | 27B (segun nombre) | No disponible | Ternaria 2 bits (Q2_0) | No disponible | GGUF + `mmproj` | Repositorio base; requiere llama.cpp u otro runtime GGUF |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (segun nombre) | No disponible | Ternaria 2 bits | No disponible | GGUF (`mmproj`) | Repositorio del adaptador multimodal citado por el autor |
| BitNet b1.58 2B4T (Microsoft) | 2B | No verificado en esta ficha | Ternaria 1,58 bits | No verificado en esta ficha | safetensors / GGUF | Alternativa ternaria de referencia, pero de escala muy inferior; datos no comprobados aqui |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparativa se limita a parametros declarados, formato y empaquetado. Cualquier afirmacion sobre calidad relativa de la cuantizacion ternaria frente a FP16 o a cuantizaciones de 4 bits requeriria una evaluacion propia.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial, redistribucion o modificación. Es un bloqueo potencial para produccion.
- Artefacto de terceros sin validacion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y lo publica un usuario individual sobre pesos de otro autor; no hay garantia de integridad ni de fidelidad respecto al modelo base.
- Ejecutable binario de origen no verificado: el propio autor advierte que Windows puede bloquearlo, que VirusTotal marca los llamafiles como sospechosos (incluidos los de Mozilla AI) y recomienda analisis con antivirus y pruebas en maquina virtual. Un solo motor de los 75 probados lo marco como malicioso. En un entorno corporativo esto es un riesgo de cadena de suministro dificil de aceptar.
- Perdida de calidad por cuantizacion: 2 bits ternarios es una compresion muy agresiva; es esperable degradacion en tareas de razonamiento fino, matematicas o generacion de codigo larga frente a pesos de mayor precision. No hay mediciones publicadas que cuantifiquen esa perdida.
- Longitud de contexto limitada en la practica: los ejemplos de la model card usan 16 384 tokens; no se documenta el maximo soportado ni el rendimiento mas alla de esa cifra.
- Idiomas no especificados: no se puede confirmar la calidad en castellano ni en idiomas distintos del ingles sin evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos, y potencialmente acentuado por la cuantizacion ternaria; no hay evaluaciones de fidelidad publicadas.
- Bucles de generacion: el autor reconoce que la generacion puede entrar en bucle infinito y recomienda subir `presence_penalty` entre 0,0 y 1,5 como mitigacion.
- Configuracion de red insegura por defecto: el servidor web escucha en todas las interfaces salvo que se pase `--host 127.0.0.1`, lo que expone el modelo a la red local.
- Problemas conocidos de plataforma: existe un issue abierto sobre rarezas de llamafile y problemas con WSL; en sistemas con Wine instalado el ejecutable puede intentar abrirse con Wine y fallar con "File does not contain a valid CIL image". Como solucion alternativa se puede invocar como script de shell (`sh /ruta/al/llamafile -h`).
- Modelo base no documentado en detalle: se desconoce el proceso de entrenamiento, la composicion del dataset y las fases de alineamiento, lo que dificulta evaluar sesgos conocidos.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita comparar su calidad con alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thread13/Ternary-Bonsai-2-27B-llamafile
- Modelo base (GGUF de desarrollo): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf-dev
- Repositorio del fichero `mmproj`: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Guia de inicio rapido de llamafile: https://github.com/mozilla-ai/llamafile/blob/main/docs/quickstart.md
- Como ejecutar un llamafile: https://github.com/mozilla-ai/llamafile/blob/main/docs/running_llamafile.md
- Como construir llamafiles: https://github.com/mozilla-ai/llamafile/blob/main/docs/creating_llamafiles.md
- Documentacion de llamafile: https://mozilla-ai.github.io/llamafile/
- Issue sobre rarezas de llamafile: https://github.com/mozilla-ai/llamafile/issues/373
- Problemas conocidos y soluciones (README 0.9.0): https://github.com/mozilla-ai/llamafile/tree/0.9.0?tab=readme-ov-file#gotchas-and-troubleshooting
- Llamafiles oficiales de Mozilla AI 0.10: https://huggingface.co/mozilla-ai/llamafile_0.10/tree/main
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Especificacion del formato APE: https://github.com/jart/cosmopolitan/blob/master/ape/specification.md#3-ape-debug-magic
- Documentacion de Qwen3.5 en Unsloth (muestreo y modo thinking): https://unsloth.ai/docs/models/qwen3.5
- Como activar o desactivar razonamiento en Qwen3.5: https://unsloth.ai/docs/models/qwen3.5#how-to-enable-or-disable-reasoning-and-thinking
