# xiq/raon-nano-agent-GGUF

## Resumen

Raon-nano-agent es un modelo de lenguaje de 3.130.811.440 parámetros (aproximadamente 3,13 mil millones) especializado en control de agentes, distribuido en formato GGUF por el usuario xiq. Se construye a partir del modelo base `xiq/Raon-1-nano-heretic`, al que se le han fusionado cuatro LoRAs independientes orientadas a tareas concretas: control de interfaz de Android mediante árbol de accesibilidad textual, navegación web agéntica, conversación en persa y descompilación de ensamblador a C.

El modelo es experimental y su propia model card lo presenta como tal. La relevancia actual reside en que demuestra una técnica de fusión de LoRAs (merge scale de 0,75, elegido sobre filas no vistas) que transforma un modelo base que apenas generaba JSON válido en uno que produce JSON correcto el 100 % de las veces en las tareas evaluadas, con mejoras drásticas en formato y estructura de acciones. Es, por tanto, más interesante como caso de estudio de ajuste fino multi-tarea que como modelo de producción.

La licencia es Apache 2.0 y la arquitectura subyacente no se detalla en la información disponible; el autor indica que llama.cpp convencional aún no carga esta arquitectura y remite a una rama específica del repositorio de KRAFTON. El contexto recomendado en los ejemplos de ejecución es de 16 384 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica que requiere una rama específica de llama.cpp, `raon-1-nano-preview`, de KRAFTON) |
| Parámetros totales | 3.130.811.440 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16 384 tokens (valor usado en los ejemplos de ejecución del autor) |
| Tipos de cuantización | GGUF; el ejemplo de la model card usa Q4_K_M |
| Idiomas soportados | no disponible como lista formal; se entrena explícitamente para persa y las tareas de agente se formulan en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 11,7 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `xiq/Raon-1-nano-heretic` (no se especifica si es un transformer denso, MoE o híbrido). Lo que sí se documenta es el proceso de ajuste: se fusionaron cuatro LoRAs sobre el modelo base, cada una entrenada con un conjunto de datos distinto convertido a filas de chat. Las cuatro habilidades son: control de UI de Android a partir del árbol de accesibilidad textual (datos de AndroidControl), agente de navegación web (Mind2Web, split de entrenamiento), chat en persa (Maux-Persian-SFT-30k, traducido automáticamente) y descompilación de ensamblador a C (decompile-bench de LLM4Binary).

La escala de fusión elegida fue 0,75, seleccionada evaluando sobre filas no vistas. Un detalle técnico relevante es que las LoRAs se entrenaron con el modo de razonamiento (thinking) desactivado, por lo que el autor recomienda ejecutar con `--reasoning off` o `enable_thinking=false`. No se documentan el volumen total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control de interfaz de Android: genera acciones estructuradas en JSON a partir de un árbol de accesibilidad textual, incluyendo tipo de acción y elemento objetivo.
- Navegación web agéntica: produce acciones de navegador (clic, selección de elemento) en formato JSON sobre observaciones de página.
- Conversación en persa: respuestas en prosa en dicho idioma, aunque el propio autor las describe como cortas y superficiales.
- Descompilación de ensamblador a C: genera código C plausible a partir de ensamblador.
- Salida JSON estructurada: el 100 % de las generaciones evaluadas en Android y web fueron JSON válido tras la fusión.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información.
- Soporte de agentes multi-paso: orientado a agentes de un paso (predicción de la siguiente acción); no se documenta razonamiento multi-paso.
- Modo thinking: desactivado por diseño en el entrenamiento de las LoRAs.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede generar secuencias de acciones (clics, entradas de texto) sobre el árbol de accesibilidad para pilotar tests instrumentados, aunque la precisión de elemento objetivo (~9 %) limita su uso a escenarios tolerantes a fallos.
- Asistente de navegación web supervisado: dado que acierta el tipo de acción el 90 % de las veces y el elemento objetivo el 57,5 %, es viable como generador de borradores de acciones que un humano o un verificador posterior valide antes de ejecutar.
- Extracción estructurada de acciones en pipelines de agentes: su capacidad de emitir JSON válido al 100 % lo hace útil como formateador de decisiones dentro de un orquestador que valide el esquema.
- Prototipado de asistentes en persa: para demos y pruebas de concepto de chat en persa con respuestas breves, aceptando la limitación de profundidad y la calidad de la traducción automática del corpus.
- Investigación en descompilación asistida: como generador de primeras versiones de código C a partir de ensamblador, siempre con revisión manual y verificación de compilación posterior.
- Estudio de técnicas de fusión de LoRAs: el modelo sirve como referencia reproducible para investigar cómo afecta la escala de merge al equilibrio entre tareas y al formato de salida.
- Despliegue local en entornos con recursos limitados: al ser un GGUF de ~3,1 B de parámetros en Q4_K_M, cabe en GPUs de consumo y permite experimentar con agentes sin depender de APIs externas.

## Benchmarks y rendimiento

Los datos provienen de la propia model card, comparando el modelo base con el fusionado, ambos en bf16 desde los pesos de HF, thinking off, decodificación greedy y sobre filas nunca entrenadas. Los tamaños de muestra son pequeños (40 filas en Android y web, 8 en descompilación).

| Tarea y métrica | Base | Fusionado | Cambio |
|---|---:|---:|---:|
| Android: loss en held-out | 3,38 | 0,32 | −3,06 |
| Android: JSON válido % | 0,00 | 100,00 | +100,00 |
| Android: tipo de acción % | 0,00 | 62,50 | +62,50 |
| Android: elemento objetivo % | 0,00 | 9,09 | +9,09 |
| Android: exact match % | 0,00 | 10,00 | +10,00 |
| Web: loss en held-out | 3,89 | 0,22 | −3,67 |
| Web: JSON válido % | 17,50 | 100,00 | +82,50 |
| Web: tipo de acción % | 30,00 | 90,00 | +60,00 |
| Web: elemento objetivo % | 0,00 | 57,50 | +57,50 |
| Web: exact match % | 0,00 | 50,00 | +50,00 |
| Persa: loss en held-out | 1,63 | 1,01 | −0,62 |
| Persa: respuesta en persa % | 98,92 | 94,98 | −3,94 |
| Persa: word F1 % | 13,37 | 15,86 | +2,48 |
| Persa: bucle/degeneración % | 85,71 | 23,81 | −61,90 |
| Asm→C: loss en held-out | 3,15 | 1,55 | −1,60 |
| Asm→C: similitud de caracteres % | 9,67 | 11,02 | +1,34 |
| Asm→C: code token F1 % | 13,35 | 19,12 | +5,77 |

El propio autor advierte que el modelo base nunca fue entrenado en estos formatos de salida, por lo que buena parte de la mejora en JSON refleja el aprendizaje del formato y no una comparación justa frente a otros agentes. No se han publicado comparaciones con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de ~3,1 B en Q4_K_M cabe holgadamente en GPUs de consumo (8 GB o menos), aunque el repo completo ocupa 11,7 GB por incluir varias cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA para llama.cpp (RTX 3060/4090, A100, H100) es suficiente; el ejemplo de compilación usa `GGML_CUDA=ON`.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp, pero obligatoriamente la rama `raon-1-nano-preview` de KRAFTON (`github.com/krafton-ai/llama.cpp`), ya que la línea principal no carga esta arquitectura. El ejemplo usa `llama-server` con `--reasoning off --ctx-size 16384`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia estructural, se trata de un modelo de ~3,1 B parámetros, licencia Apache 2.0 y formato GGUF, especializado en agentes; los modelos comparables de esa franja (por ejemplo, modelos de 3 B orientados a agentes) no aparecen evaluados en la model card, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Raon-nano-agent | 3,13 B | 16 384 (uso recomendado) | Apache 2.0 | GGUF |
| Alternativas de ~3 B para agentes | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo explícitamente experimental según su autor; no recomendado para producción sin validación adicional.
- Android es débil: el tipo de acción acierta el 62,5 %, pero el elemento objetivo exacto solo el 9,09 %; el modelo recurre con frecuencia a clics por coordenadas.
- Las métricas de Android y web proceden de los mismos datasets de entrenamiento (filas distintas, posiblemente mismos episodios o sitios), por lo que son optimistas.
- Muestras muy pequeñas: 40 filas en Android y web, 8 en descompilación; una sola fila mueve las métricas 2,5 y 12,5 puntos respectivamente.
- Persa: respuestas cortas y superficiales, corpus traducido automáticamente, y la proporción de respuestas en persa baja ligeramente (98,92 % → 94,98 %).
- Descompilación: las salidas son C plausible pero no verificado que compile ni que reproduzca el comportamiento del binario original.
- Riesgo de alucinación y de degeneración en bucle: aunque el bucle baja del 85,71 % al 23,81 % en persa, sigue presente en casi una de cada cuatro generaciones.
- Requiere una rama no estándar de llama.cpp, lo que complica el despliegue y la integración con herramientas estándar.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas y la falta de validación desaconsejan hacerlo sin evaluación propia.
- No se documentan sesgos específicos ni lista formal de idiomas soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiq/raon-nano-agent-GGUF
- Modelo base: https://huggingface.co/xiq/Raon-1-nano-heretic
- Rama de llama.cpp requerida: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano-preview`)
- Dataset AndroidControl: no disponible como enlace directo en la información
- Dataset Mind2Web (osunlp/Mind2Web): no disponible como enlace directo en la información
- Dataset Maux-Persian-SFT-30k (xmanii): no disponible como enlace directo en la información
- Dataset decompile-bench (LLM4Binary): no disponible como enlace directo en la información
