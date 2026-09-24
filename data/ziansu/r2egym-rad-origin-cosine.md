# ziansu/r2egym-rad-origin-cosine

## Resumen

RAD origin-cosine sobre R2E-Gym es un ajuste por aprendizaje de refuerzo del modelo base Qwen/Qwen3.5-4B, publicado por el usuario ziansu. No es un modelo de propósito general: es una política entrenada específicamente para actuar como agente de ingeniería de software, es decir, para resolver tareas de reparación de código dentro de un arnés tipo SWE-bench. El repositorio contiene un único punto de control, `step40`, resultado de 40 actualizaciones de entrenamiento con el método RAD (preset `lookahead-projected-ascent-origin-cosine`) frente a un profesor congelado Qwen3.6-27B.

El modelo de lenguaje tiene 4,21 B de parámetros y el punto de control conserva además la torre de visión del base, lo que eleva el total a 4,54 B cuando se carga como `Qwen3_5ForConditionalGeneration`. La evaluación del proyecto se hizo únicamente con el modelo de lenguaje. Sobre SWE-bench Verified (500 tareas, semilla 42, 3 muestras por tarea) alcanza un pass@1 del 51,13 % con el protocolo de 98.304 tokens de contexto y 100 turnos, y un pass@3 del 65,00 %, el más alto de las seis políticas comparadas en la misma campaña.

Su relevancia es metodológica: iguala el rango de rendimiento de las líneas base (TIP, RLAD, OPD) empleando la mitad de actualizaciones (40 frente a 79-80), y se publica junto a repositorios de comparación con subcarpetas `step40` equiparables, lo que facilita reproducir la comparación en igualdad de condiciones. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 con módulos de atención lineal (`linear_attn` presente en 24 capas, según los nombres de tensores del punto de control) y torre de visión heredada del base. Clases: `Qwen3_5ForCausalLM` (solo lenguaje) y `Qwen3_5ForConditionalGeneration` (lenguaje + visión) |
| Parametros totales | 4,21 B en el modelo de lenguaje; 4,54 B al cargar el modelo completo con la torre de visión |
| Parametros activos | No aplica / no disponible: la información proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible como especificación oficial del modelo. En entrenamiento se usó contexto de rollout de 65.536 tokens; la evaluación principal se realizó con protocolo de 98.304 tokens y 100 turnos |
| Tipos de cuantizacion | No disponibles. Los pesos se distribuyen en bfloat16, salvo 48 tensores (`linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas) que se almacenan en bfloat16 donde el base usa float32 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`); los pesos están en la subcarpeta `step40`, la raíz del repositorio no contiene pesos. Tamano del repo: 9,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B. Los nombres de tensores del punto de control exportado (`linear_attn.A_log` y `linear_attn.norm.weight` en 24 capas) indican la presencia de módulos de atención lineal junto con las capas de atención habituales de la familia, además de una torre de visión que el entrenamiento no modificó: según el autor, es idéntica byte a byte a la del modelo base, y solo se actualizó el modelo de lenguaje. El punto de control contiene los 738 tensores del conjunto de claves del base con formas coincidentes.

El entrenamiento usa el método RAD con el preset `lookahead-projected-ascent-origin-cosine`, contra un profesor congelado Qwen3.6-27B. Se aplicó una caja de pesos por token con origen annealed según una schedule coseno y coeficiente 0,1; el horizonte de origen (valor por defecto del preset, 100) hizo que el origen pasara de 1,0 a aproximadamente 0,66 a lo largo de las 40 actualizaciones. El corpus es un subconjunto de R2E-Gym. La configuración de entrenamiento es: contexto de rollout de 65.536 tokens, tasa de aprendizaje 1e-6, lote global 256, lote de rollout de 32 grupos de tareas con 8 muestras por actualización, y un total de 40 actualizaciones. Todos los hiperparámetros, salvo el método, coinciden con los cuatro repositorios de referencia del mismo conjunto (`r2egym-grpo`, `r2egym-opd`, `r2egym-tip`, `r2egym-rlad`).

La exportación se hizo desde la copia de seguridad del punto de control EFS de `ocf0916b` (`updates_000040`, marcador 39) con la herramienta `tools/convert_torch_dist_to_hf.py` de slime, con `--vocab-size 248320 -a`. Durante el entrenamiento todos los parámetros se mantuvieron en bfloat16, y esa es la precisión con la que sirvió el servidor de inferencia durante el entrenamiento y la evaluación.

## Capacidades

- Resolución de tareas de ingeniería de software dentro de un arnés de agente: lectura y modificación de repositorios, generación de parches y ejecución de comandos, tal como se evalúa en SWE-bench Verified.
- Generación de texto autoregresiva (`pipeline_tag: text-generation`) con la plantilla y el tokenizador de Qwen3.5.
- Razonamiento multi-turno: los protocolos de evaluación emplean hasta 100 turnos, lo que implica mantener el estado de la tarea a lo largo de muchas interacciones.
- Manejo de contextos largos durante la evaluación: se reportan resultados con 98.304 tokens de contexto y con 65.536 tokens, este último coincidente con el contexto de rollout del entrenamiento.
- Capacidad de visión heredada: el punto de control incluye la torre de visión del base sin modificar, por lo que `Qwen3_5ForConditionalGeneration` puede cargarse, aunque no se ha evaluado ni entrenado esa capacidad en este proyecto.
- Soporte de tool calling / function calling: no documentado en la información disponible; el uso previsto es como política dentro de un arnés de agente, no como modelo conversacional con herramientas declaradas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reparación automática de incidencias en repositorios: el modelo está entrenado y evaluado para recibir el estado de un repositorio más un problema descrito en lenguaje natural y producir un parche. Es su caso de uso nativo, con un pass@1 del 51,13 % en SWE-bench Verified.
- Integración en pipelines de CI/CD para corregir tests fallidos: dado un fallo de test y el árbol de código, la política puede generar un parche candidato que se valida ejecutando de nuevo la suite; el contexto de 65.536 tokens permite incluir varios ficheros relevantes sin truncar.
- Mantenimiento de código heredado: tareas de corrección localizadas (cambios de API, correcciones de tipado, arreglos de compatibilidad) que requieren entender una base de código extensa antes de editar, aprovechando la ventana de contexto larga del protocolo de evaluación.
- Agente de migración de dependencias: actualizar versiones de librerías y reparar los puntos de ruptura en varios ficheros, iterando en múltiples turnos hasta que la compilación o los tests pasan.
- Generación de tests de regresión a partir de un parche: el modelo puede producir las pruebas que cubren el cambio y verificar su consistencia con el comportamiento esperado del repositorio.
- Sustitución o comparación de políticas en investigación sobre RL para agentes: al compartir hiperparámetros con las líneas base y publicarse la subcarpeta `step40` equivalente, sirve como punto de comparación reproducible con 40 actualizaciones frente a las 79-80 de TIP, RLAD y OPD.
- Revisión asistida de cambios en contexto largo: dado un diff extenso más el código circundante, el modelo puede señalar incoherencias y proponer correcciones, dentro del mismo esquema de agente multi-turno.

## Benchmarks y rendimiento

Evaluación sobre SWE-bench Verified, las 500 tareas, semilla 42 y 3 muestras por tarea (1.500 intentos). El pass@1 se reporta con la desviación estándar de muestra entre las tres tasas de pass a nivel de rollout.

| Protocolo | pass@1 | pass@3 |
|---|---|---|
| 98.304 contexto / 100 turnos | 51,13 % ± 1,33 | 65,00 % |
| 65.536 contexto / 75 turnos | 47,60 % ± 1,00 | 60,20 % |

Comparación bajo el protocolo de 98.304 tokens / 100 turnos, con cada método en sus actualizaciones finales:

| Metodo | Actualizaciones | pass@1 | pass@3 |
|---|---|---|---|
| TIP | 80 | 52,20 | 64,40 |
| RLAD | 79 | 51,80 | 63,20 |
| OPD | 79 | 51,67 | 63,80 |
| RAD origin-cosine | 40 | 51,13 | 65,00 |
| GRPO | 80 | 46,00 | 61,60 |

El propio autor señala que el error estándar binomial a 500 tareas es de aproximadamente 1,3 puntos antes de la varianza de rollout, por lo que los cuatro mejores valores de pass@1 quedan dentro de menos de un error estándar y no son separables. Los dos elementos destacables son que esta política alcanza esa banda con la mitad de actualizaciones que las líneas base y que su pass@3 es el más alto del conjunto evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: los 4,21 B parámetros del modelo de lenguaje en bfloat16 ocupan aproximadamente 8,4 GB de pesos; con la torre de visión (4,54 B) rondan los 9,1 GB. A esa cifra hay que sumar la caché KV, que depende del protocolo: la evaluación principal usa 98.304 tokens de contexto y 100 turnos, un escenario exigente en memoria.
- GPU recomendadas para el protocolo largo de evaluación: A100 80 GB o H100 80 GB, por la combinación de contexto de 98.304 tokens y muchos turnos. Para el protocolo de 65.536 tokens, una GPU de 40-48 GB resulta suficiente.
- Cabe en GPU de consumo: sí para los pesos. Una RTX 4090, RTX 3090 o RTX 4080 (16-24 GB) puede alojar el modelo en bfloat16; en las de 16 GB el margen para caché KV en contextos muy largos es reducido.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (o `AutoModelForImageTextToText` para el modelo completo) es la vía documentada por el autor, indicando siempre `subfolder="step40"`. Servidores de inferencia como vLLM o TGI son compatibles con pesos safetensors de `transformers`, pero no se documentan en la información disponible. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. Tampoco se publican requisitos de hardware concretos usados en la evaluación.

## Comparativa con modelos similares

Los comparables directos son las otras políticas del mismo conjunto de repositorios, todas evaluadas con el mismo protocolo, la misma semilla y el mismo número de muestras. No se dispone de enlaces ni de fichas detalladas de ellas en la información proporcionada.

| Modelo | Parametros | Contexto | pass@1 (98k/100t) | Actualizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RAD origin-cosine (este) | 4,21 B (LM) / 4,54 B con visión | No especificado; evaluado hasta 98.304 | 51,13 | 40 | apache-2.0 | Peso en HF, subcarpeta `step40` |
| TIP | No disponible | No disponible | 52,20 | 80 | No disponible | Repositorio `r2egym-tip` (subcarpeta `step40`) |
| RLAD | No disponible | No disponible | 51,80 | 79 | No disponible | Repositorio `r2egym-rlad` (subcarpeta `step40`) |
| OPD | No disponible | No disponible | 51,67 | 79 | No disponible | Repositorio `r2egym-opd` (subcarpeta `step40`) |
| GRPO | No disponible | No disponible | 46,00 | 80 | No disponible | Repositorio `r2egym-grpo` (subcarpeta `step40`) |

Frente a Qwen/Qwen3.5-4B, el modelo base, no se aportan resultados de benchmarks en esta información, por lo que no es posible cuantificar la ganancia atribuible al entrenamiento RAD.

## Limitaciones y advertencias

- Es un modelo especializado, no un asistente de propósito general: está entrenado sobre un subconjunto de R2E-Gym para tareas de reparación de código y su rendimiento fuera de ese dominio no está caracterizado.
- Dependencia del arnés: las cifras de SWE-bench corresponden a una política integrada en un agente con protocolo de turnos concreto. Los resultados no son reproducibles cargando el modelo en modo generación simple.
- Sensibilidad al protocolo: el mismo modelo pasa de 51,13 % a 47,60 % de pass@1 al reducir el contexto de 98.304 a 65.536 tokens y los turnos de 100 a 75. Las prestaciones en producción dependerán fuertemente de la ventana y del presupuesto de interacción.
- Diferencias no significativas: los cuatro mejores pass@1 del conjunto quedan dentro de un error estándar, así que las comparaciones de ranking entre TIP, RLAD, OPD y RAD no deben interpretarse como ventajas reales.
- Precisión no uniforme: 48 tensores se almacenan en bfloat16 donde el modelo base usa float32. Los pesos reproducen la política evaluada, pero no coinciden bit a bit con el base en esos tensores.
- Torres de visión sin evaluar: aunque el punto de control incluye la torre de visión, no se entrenó ni se evaluó; su comportamiento no está garantizado en este repositorio.
- Sesgos y alucinación: no se publica ningún análisis de sesgos. Al ser un modelo generativo aplicado a código, puede producir parches plausibles pero incorrectos, por lo que requiere validación mediante ejecución de tests antes de cualquier uso en producción.
- Idiomas: no se documenta el soporte multilingüe; el entrenamiento y la evaluación son en inglés (SWE-bench).
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de R2E-Gym por separado.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin revisión externa independiente.
- La raíz del repositorio no contiene pesos: cualquier carga debe indicar `subfolder="step40"` o fallará.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ziansu/r2egym-rad-origin-cosine
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorios de comparación citados (sin URL proporcionada): `r2egym-grpo`, `r2egym-opd`, `r2egym-tip`, `r2egym-rlad`
- Herramienta de conversión citada: `slime`, `tools/convert_torch_dist_to_hf.py` (sin URL proporcionada)
- Paper, blog o demo: no disponibles en la información proporcionada
