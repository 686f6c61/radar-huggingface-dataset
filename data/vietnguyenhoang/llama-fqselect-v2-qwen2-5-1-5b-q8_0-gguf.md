# VietNguyenHoang/Llama-FQSelect-v2-Qwen2.5-1.5B-Q8_0-GGUF

## Resumen

Llama-FQSelect-v2-Qwen2.5-1.5B-Q8_0-GGUF es un artefacto de investigación distribuido en formato GGUF cuantizado a 8 bits (Q8_0). Se trata del estudiante del método FQ-Select v2, presentado en el artículo *Selecting Reasoning Traces by Familiarity and Quality for Small Language Model Distillation* (Vu, Nguyen, Nguyen Le; Universidad Ton Duc Thang). El modelo parte de Qwen2.5-1.5B (versión base, no instruct) y se afina con LoRA sobre 5.685 soluciones matemáticas paso a paso seleccionadas por FQ-Select v2 entre las generadas por tres profesores: DeepSeek-V3, Qwen2.5-VL-72B-Instruct y Llama-3.3-70B-Instruct.

El prefijo "Llama" del nombre no refleja la arquitectura: es una exigencia de la Llama 3.3 Community License para modelos distribuidos entrenados con salidas de Llama 3.3. La arquitectura y los pesos subyacentes son de Qwen2.5-1.5B, con 1.543.714.304 parámetros totales y un repositorio de 1,6 GB.

Su relevancia es acotada y explícita: es una prueba de concepto que demuestra que un estudiante destilado para este artículo se ejecuta en un portátil convencional, resolviendo problemas de matemáticas escolares y de competición con la respuesta final en `\boxed{}`. No es un asistente general: no fue entrenado para chat, seguridad ni tareas fuera del dominio matemático, y falla aproximadamente la mitad de los intentos en MATH-500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B base, fine-tuning LoRA) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-1.5B; no se especifica en la model card) |
| Tipos de cuantizacion | Q8_0 (8 bits); el LoRA se fusiona en float32 antes de convertir |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.3-and-qwen-terms (Other); sujeto ademas a Apache 2.0 del modelo base |
| Formato de pesos | GGUF (archivo `Llama-FQSelect-v2-Qwen2.5-1.5B-Q8_0.gguf`, 1,65 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1.500 millones de parametros, heredado de Qwen2.5-1.5B en su variante base. Sobre esa base se aplica un fine-tuning LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atencion y feed-forward, con tasa de aprendizaje 1e-4 y decaimiento coseno, 3 epocas, tamano de lote 16, entrenamiento en 16 bits y semilla 42. El adaptador se fusiona en float32 y posteriormente se convierte con llama.cpp y se cuantiza a Q8_0.

Los datos de entrenamiento consisten en 1.895 preguntas de GSM8K y del split de entrenamiento de MATH (excluyendo MATH-500), con tres soluciones correctas por pregunta seleccionadas por FQ-Select v2 de entre las escritas por DeepSeek-V3, Qwen2.5-VL-72B-Instruct y Llama-3.3-70B-Instruct, totalizando 5.685 soluciones paso a paso. La innovacion tecnica destacable es el propio criterio de seleccion FQ-Select v2, que combina familiaridad y calidad de las trazas de razonamiento para la destilacion; el articulo reporta que FQ-Select v2 no supera a GRAPE, la regla de seleccion que extiende (54,15 frente a 55,10 en MATH-500, semilla 42). No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto orientada a razonamiento matematico paso a paso (chain-of-thought).
- Resolucion de problemas de matematicas escolares y de competicion, con la respuesta final delimitada en `\boxed{}`.
- Formato conversacional basado en Qwen ChatML, con plantilla de prompt y system prompt definidos en el `Modelfile`.
- Ejecucion local en hardware de consumo mediante llama.cpp, Ollama y LM Studio.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso mas alla de la cadena de pensamiento matematica.
- Capacidad multilingue limitada al ingles.
- Sin capacidades de vision ni audio, pese a que uno de los profesores del dataset sea un modelo vision-language.

## Casos de uso

- Investigacion sobre destilacion de razonamiento: reproducir el pipeline del articulo ejecutando el `Modelfile` en Ollama y comparando las trazas generadas con las del adaptador LoRA original en Transformers, para aislar el efecto de la cuantizacion y del motor de inferencia.
- Evaluacion de seleccion de datos: usar el modelo como estudiante de referencia al comparar reglas de seleccion de trazas (FQ-Select v2 frente a GRAPE) sobre el mismo conjunto de preguntas de GSM8K y MATH.
- Docencia y demostracion en el aula: mostrar en un portatil con Apple M4 Pro como un modelo de 1,5B resuelve problemas de aritmetica y algebra paso a paso, con unos 110 tokens por segundo y 1,7 GB de memoria.
- Pruebas de banco de razonamiento matematico: ejecutar MATH-500 con 4 muestras por pregunta y las temperaturas del `Modelfile` (0,6; top-p 0,95; hasta 3.072 tokens nuevos) para obtener Acc@4 y Pass@4 reproducibles.
- Generacion de soluciones candidatas para anotacion: producir cadenas de razonamiento que un anotador humano revise antes de incorporarlas a un dataset de entrenamiento, dado que el modelo acierta en torno al 51,5 % de las muestras.
- Validacion de despliegue en entornos sin GPU: verificar que el GGUF Q8_0 carga y genera correctamente en llama.cpp y LM Studio con el mismo system prompt y parametros de muestreo, como paso previo a integrarlo en un pipeline de evaluacion automatizada.

## Benchmarks y rendimiento

| Version | Motor | Acc@4 | Pass@4 |
|---|---|---|---|
| Adaptador LoRA, semilla 42 (articulo) | Transformers en RTX 3060 | 54,1 | No disponible |
| Este archivo (Q8_0) | Ollama en Apple M4 Pro | 51,5 | 69,2 |

Evaluacion sobre MATH-500 con 4 muestras por pregunta y los parametros del `Modelfile`. La diferencia pareada sobre las 500 preguntas es de -2,6 puntos, con intervalo del 95 % de -4,9 a -0,4, por lo que este archivo es mediblemente mas debil que la evaluacion reportada en el articulo; la perdida procede de la conversion, la cuantizacion a 8 bits y el motor de inferencia en conjunto, sin que el autor los haya separado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB de memoria con la cuantizacion Q8_0 (1,65 GB de pesos).
- GPU recomendadas: no se especifican; el autor reporta ejecucion en una RTX 3060 (evaluacion del adaptador LoRA en Transformers) y en un Apple M4 Pro (este archivo GGUF).
- Cabe en GPU de consumo: si, con 1,7 GB de memoria es viable en practicamente cualquier GPU consumer con 4 GB o mas, y tambien en CPU.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido), llama.cpp y LM Studio. No se mencionan vLLM ni TGI.
- Latencia y throughput: aproximadamente 110 tokens por segundo en Apple M4 Pro con 1,7 GB de memoria. No se reportan latencias para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-FQSelect-v2-Qwen2.5-1.5B-Q8_0 | 1,54B | No disponible | Acc@4 51,5 (Pass@4 69,2) | llama3.3-and-qwen-terms | GGUF en Hugging Face |
| Qwen2.5-1.5B (base) | 1,54B | No disponible en la informacion | No disponible | Apache 2.0 | Hugging Face |
| Estudiante con seleccion GRAPE (articulo) | No disponible | No disponible | 55,10 (semilla 42) | No disponible | No disponible |

No se dispone de datos de benchmarks de Qwen2.5-1.5B base en la informacion proporcionada, por lo que la comparacion directa de rendimiento con el modelo de partida no puede cuantificarse. La unica comparacion numerica disponible es interna al articulo: FQ-Select v2 (54,15) frente a GRAPE (55,10) sobre MATH-500 con semilla 42.

## Limitaciones y advertencias

- No es un asistente general: no fue entrenado para chat, seguridad ni tareas fuera del dominio matematico.
- Falla aproximadamente la mitad de los intentos en MATH-500 (Acc@4 de 51,5), por lo que su uso en produccion sin revision humana es desaconsejable.
- Unicamente soporta ingles; no se documentan capacidades en castellano ni en otros idiomas.
- Riesgo de alucinacion en la cadena de razonamiento y en la respuesta final, especialmente fuera de los dominios de GSM8K y MATH.
- Los parametros de muestreo importan: los valores por defecto de Ollama (top-k 40, repeat penalty 1,1) difieren de los del `Modelfile` y reducen la precision.
- La licencia es compuesta y restrictiva: el modelo esta sujeto a la Llama 3.3 Community License y a su Acceptable Use Policy (por las trazas generadas por Llama-3.3-70B-Instruct), a la Qwen License Agreement (por Qwen2.5-VL-72B-Instruct) y a la Apache 2.0 del modelo base Qwen2.5-1.5B. El usuario es responsable de cumplir cada conjunto de terminos.
- El prefijo "Llama" en el nombre puede inducir a confusion sobre la arquitectura real, que es Qwen2.5.
- El articulo esta en revision y no se han publicado aun los datos de citacion.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VietNguyenHoang/Llama-FQSelect-v2-Qwen2.5-1.5B-Q8_0-GGUF
- Dataset de destilacion y evaluacion: https://huggingface.co/datasets/VietNguyenHoang/fq-select-math-distillation
- Repositorio de codigo: https://github.com/JasonNguyen31/QD-RSR-Project
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia Llama 3.3 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/LICENSE
- Politica de uso aceptable de Llama 3.3: https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/USE_POLICY.md
