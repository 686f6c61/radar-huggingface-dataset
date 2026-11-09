# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd880-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd880-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba Qwen. Lo desarrolla el usuario de Hugging Face uygarkurt y su objetivo concreto es dotar a un modelo pequeno de 0,5 mil millones de parametros de capacidades de tool calling estructurado y de abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se ha entrenado con la tecnica de destilacion on-policy (OPD), partiendo directamente del modelo instructivo base.

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion reproducible, no de un modelo de produccion. Con 880 actualizaciones de OPD y solo 0,4 horas de entrenamiento, el autor documenta un incremento en la precision de function calling de un solo turno (BFCL) del 50,28% al 52,79% y una mejora en la metrica de relevancia del 77,78% al 83,33%, a costa de un deterioro notable en la deteccion de irrelevancia (del 66,93% al 45,72%) y en MATH-500 (del 15,80% al 13,60%). El modelo base emplea una arquitectura transformer densa con 0,5B parametros y una ventana de contexto de 32.768 tokens segun la documentacion oficial de Qwen2.5, aunque la evaluacion de este adaptador limita los prompts a 640 tokens.

El interes practico reside en el metodo: demuestra como un modelo de 0,5B puede especializarse en generacion de llamadas a herramientas mediante destilacion desde un profesor congelado de 3B (`Qwen/Qwen2.5-3B-Instruct`), sin necesidad de reentrenamiento completo. Es util como referencia para quienes exploran tecnicas de post-entrenamiento eficiente en modelos pequenos, no como solucion lista para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; la evaluacion del adaptador usa un limite de prompt de 640 tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizaciones estandar de la familia Qwen2.5 (GPTQ, AWQ, GGUF) no verificadas para este adaptador |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer denso de la familia Qwen2.5 con 0,5B parametros. El entrenamiento emplea destilacion on-policy (OPD): el estudiante (el modelo base de 0,5B) genera sus propias respuestas y aprende a partir de las probabilidades por token que asigna un profesor congelado, `Qwen/Qwen2.5-3B-Instruct`. Este enfoque difiere de la destilacion offline clasica porque el estudiante ve distribuciones sobre trayectorias que el mismo produce, lo que alinea el entrenamiento con la distribucion de inferencia.

El dataset de entrenamiento es `uygarkurt/xlam-tool-calling-mixed`, orientado a tool calling estructurado y a la abstención ante herramientas irrelevantes. Se realizaron 880 actualizaciones de OPD con un tiempo de bucle de entrenamiento de 0,4 horas (excluyendo carga de modelos, preparacion de datos y evaluacion externa). El pipeline de entrenamiento es `uygarkurt/post-training-lab`. No se documentan en la model card el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: generacion de llamadas a funciones en formato estructurado, evaluado con las metricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Function calling de un solo turno, evaluado con subconjuntos de BFCL-v3.
- Abstención ante herramientas irrelevantes: el adaptador se entrena explicitamente para no invocar herramientas cuando no son pertinentes, aunque los resultados muestran un deterioro en esta capacidad respecto al base (ver benchmarks).
- Razonamiento basico y matematicas elementales, con rendimiento limitado por el tamano del modelo (MATH-500 en torno al 14%).
- Seguimiento de instrucciones a nivel de prompt (IFEval), con valores proximos al 27%.
- Capacidades multilingues: no disponibles; la model card declara solo ingles.
- No se documentan capacidades de vision, audio, modo thinking ni agentes multi-paso.

## Casos de uso

- Prototipado de asistentes con tool calling en entornos de recursos muy limitados: el modelo de 0,5B puede ejecutarse en CPU o en GPUs de gama baja, lo que permite validar pipelines de function calling antes de escalar a modelos mayores.
- Investigacion sobre destilacion on-policy: sirve como caso reproducible para estudiar como un profesor de 3B transfiere capacidades de tool calling a un estudiante de 0,5B con 880 actualizaciones y 0,4 horas de entrenamiento.
- Generacion de llamadas a funciones en ingles para tareas de enrutamiento simple: dado un conjunto pequeno de herramientas bien definidas, el modelo puede seleccionar la funcion y sus argumentos con una precision de nombre de funcion del 86,14% en el split de test del dataset mixto.
- Filtrado de consultas que no requieren herramientas: a pesar del deterioro en la metrica de irrelevancia (45,72%), puede integrarse como primer filtro en un pipeline de agentes donde la abstención erronea se gestione con una capa de validacion posterior.
- Base para fine-tuning adicional: al ser un adaptador LoRA sobre un modelo pequeno, es un punto de partida economico para experimentos de especializacion en dominios concretos con presupuesto de computo minimo.
- Educacion y docencia: util para demostrar el flujo completo de PEFT, carga de adaptadores con la libreria `peft` y evaluacion con BFCL y xLAM en un entorno asequible.
- Evaluacion comparativa de tecnicas de post-entrenamiento: sirve como linea base para contrastar OPD frente a SFT o DPO en modelos sub-1B.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes). La primera fila es el modelo base; la segunda, el adaptador OPD.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% | — |
| OPD (este adaptador) | OPD 880 | 42,34% | 13,60% | 26,99% | 61,43% | 86,14% | 52,79% | 83,33% | 45,72% | 0,4 |

Notas metodologicas de la model card: xLAM ETC es la precision exacta de llamada a herramienta y xLAM FNA la precision del nombre de funcion; ambas se calculan sobre el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM emplean scripts propios de `post-training-lab`.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precision FP16 ocupa aproximadamente 1 GB de pesos; en cuantizacion de 8 bits, en torno a 0,5-0,6 GB; en 4 bits, alrededor de 0,3-0,4 GB. El adaptador LoRA anade una sobrecarga minima no cuantificada en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; `vLLM` y `TGI` admiten adaptadores LoRA, aunque la compatibilidad concreta con este adaptador no esta documentada; `llama.cpp` y `Ollama` requeririan fusionar el adaptador con el modelo base y convertir los pesos, paso no documentado por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU y throughput alto en lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens | Modelo instructivo generalista | Apache 2.0 (segun Qwen) | Hugging Face |
| Este adaptador (OPD 880) | 0,5B + LoRA | 32.768 tokens (base); evaluado a 640 tokens de prompt | Tool calling y abstención via OPD | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens | Modelo instructivo generalista | Apache 2.0 (segun Qwen) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Modelo instructivo generalista | Apache 2.0 (segun Qwen) | Hugging Face |

La comparacion directa con alternativas especializadas en tool calling de tamano similar no esta disponible en la informacion proporcionada. Los datos de la model card permiten comparar el adaptador con su propio modelo base, que es la referencia mas directa.

## Limitaciones y advertencias

- El adaptador solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El deterioro en la metrica de irrelevancia (de 66,93% a 45,72%) indica que el modelo tiende a invocar herramientas cuando no deberia, un riesgo relevante en pipelines de agentes.
- El rendimiento en matematicas empeora respecto al base (MATH-500 de 15,80% a 13,60%), lo que sugiere un cierto olvido catastrofico tras el entrenamiento OPD.
- La evaluacion xLAM descarta 743 de 3.289 ejemplos por el limite de 640 tokens de prompt, lo que puede sesgar los resultados hacia consultas cortas.
- Las metricas BFCL, Relevance e Irrelevance son agregados propios del estudio, no resultados oficiales del benchmark, y no son directamente comparables con cifras publicadas de terceros.
- La licencia no esta disponible en la model card, lo que impide confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion inherente a un modelo de 0,5B: la precision en MMLU (42,34%) y MATH-500 (13,60%) indica capacidad limitada de razonamiento factual y matematico.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- No hay informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- El tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el tamano es inferior a la resolucion de la interfaz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd880-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento: https://github.com/uygarkurt/post-training-lab
