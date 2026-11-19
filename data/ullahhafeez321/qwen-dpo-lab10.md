# ullahhafeez321/qwen-dpo-lab10

## Resumen

`ullahhafeez321/qwen-dpo-lab10` es un repositorio de artefactos de un experimento academico de alineamiento mediante Direct Preference Optimization (DPO) sobre el modelo base `Qwen/Qwen2.5-0.5B`. No se trata de un modelo nuevo entrenado desde cero, sino de dos adaptadores LoRA (PEFT) entrenados con valores de beta DPO distintos (0.1 y 0.5), junto con los CSV de evaluacion, metricas de entrenamiento y checkpoints del experimento. El autor lo publica como evidencia reproducible de una practica universitaria de laboratorio de modelos de lenguaje.

El objetivo declarado es investigar si el alineamiento por preferencias cambia el comportamiento de un modelo preentrenado y examinar el efecto de modificar el parametro beta. El modelo base Qwen2.5-0.5B es un transformer causal de 0.5 mil millones de parametros desarrollado por el equipo Qwen (Alibaba), con licencia Apache 2.0 en su version original, aunque el repositorio del adaptador no declara licencia propia.

La relevancia de esta ficha es acotada: se trata de un artefacto educativo, no de un modelo listo para produccion. El propio autor advierte que las salidas de las tres configuraciones son a menudo similares y que la evidencia disponible no demuestra que ningun valor de beta mejore de forma consistente la utilidad, relevancia o seguimiento de instrucciones. Cualquier uso debe considerar esta limitacion de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Qwen2.5-0.5B) con adaptadores LoRA |
| Parametros totales | 0.5B en el modelo base; adaptadores LoRA con r=16 (parametros del adaptador no disponibles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; el modelo base admite cuantizacion segun el ecosistema Qwen) |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere cargar junto al modelo base |
| Libreria | peft |
| Dataset de preferencias | trl-lib/ultrafeedback_binarized |
| Valores de beta DPO | 0.1 y 0.5 |
| Configuracion LoRA | r=16, alpha=32, dropout=0.05, bias=none |
| Modulos objetivo LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Epocas de entrenamiento | 1 por ejecucion |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B, un transformer causal decoder-only del equipo Qwen. Sobre el se aplican dos adaptadores LoRA independientes entrenados con DPO mediante Hugging Face TRL y PEFT. La configuracion LoRA registrada en los archivos PEFT es r=16, alpha=32, dropout=0.05, sin bias, con modulos objetivo que cubren atencion (q_proj, k_proj, v_proj, o_proj) y MLP (gate_proj, up_proj, down_proj). La tarea PEFT es CAUSAL_LM.

El entrenamiento usa el dataset de preferencias `trl-lib/ultrafeedback_binarized` durante 1 epoca por configuracion. Las metricas registradas son: beta 0.1 con perdida de entrenamiento 0.681721 y runtime de 383.4160 s; beta 0.5 con perdida 0.659785 y runtime de 385.7389 s. El autor advierte explicitamente que la perdida de entrenamiento mide el objetivo de DPO y no debe interpretarse por si sola como prueba de mejor calidad o mejor alineamiento. No se documentan detalles adicionales sobre hiperparametros de optimizacion, composicion exacta del dataset ni procesos de RLHF previos.

## Capacidades

- Generacion de texto causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Alineamiento por preferencias mediante DPO, con dos variantes de beta (0.1 y 0.5) para comparacion.
- Evaluacion sobre 10 prompts que cubren explicacion, consejo, resumen, escritura profesional, razonamiento y respuesta a preguntas.
- Soporte de carga mediante Transformers + PEFT (PeftModel) junto al modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: solo se declara ingles (`en`); no se documenta soporte de otros idiomas.

## Casos de uso

- Reproduccion de un experimento academico de DPO: permite a estudiantes e investigadores cargar los adaptadores y comparar las salidas base frente a beta 0.1 y beta 0.5 usando los CSV incluidos, verificando el efecto del alineamiento por preferencias en un modelo pequeno.
- Estudio del efecto del parametro beta en DPO: los dos adaptadores permiten analizar como varia la perdida y el comportamiento generado al modificar la fuerza de la regularizacion KL implicita en DPO, con las metricas registradas como punto de partida.
- Docencia sobre PEFT y LoRA: el repositorio sirve como ejemplo practico de configuracion de adaptadores (r=16, alpha=32, modulos objetivo) y de carga con Transformers + PEFT.
- Evaluacion humana comparativa: la plantilla `human_ratings_template.csv` permite disenar un protocolo de evaluacion con rubrica comun para las tres configuraciones, tal como sugiere el autor.
- Analisis de limitaciones de modelos pequenos alineados: los CSV de salidas permiten estudiar fallos tipicos (continuaciones irrelevantes, respuestas incompletas, errores de razonamiento) en un modelo de 0.5B tras DPO.
- Base para experimentos posteriores: los adaptadores y checkpoints pueden servir como punto de partida para probar otros valores de beta, otros datasets de preferencias o tecnicas alternativas de alineamiento en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye unicamente metricas de entrenamiento (perdida y runtime) y CSV de salidas generadas, no puntuaciones en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Configuracion | Perdida de entrenamiento | Epoca | Runtime (s) |
|---|---:|---:|---:|
| DPO beta 0.1 | 0.681721 | 1.0 | 383.4160 |
| DPO beta 0.5 | 0.659785 | 1.0 | 385.7389 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en fp16 requiere aproximadamente 1 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; los adaptadores LoRA anaden una cantidad marginal. En cuantizacion de 4 bits cabria en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: Transformers + PEFT (metodo documentado por el autor); el modelo base Qwen2.5-0.5B es compatible con llama.cpp, Ollama y vLLM, aunque la carga de adaptadores LoRA depende del soporte de cada herramienta.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento de 1 epoca tardo aproximadamente 383-386 s en el entorno del autor, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ullahhafeez321/qwen-dpo-lab10 | 0.5B (base) + LoRA | no disponible | Adaptador DPO educativo | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B | 0.5B | no disponible en esta ficha | Modelo base preentrenado | Apache 2.0 (segun el modelo original) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | no disponible en esta ficha | Modelo ajustado por instrucciones | Apache 2.0 (segun el modelo original) | Hugging Face |
| Modelos DPO de 0.5B de terceros | ~0.5B | variable | Adaptadores DPO | variable | Hugging Face |

La comparacion directa con benchmarks no es posible porque el repositorio no publica puntuaciones. Frente al modelo base y a la variante Instruct oficial de Qwen, este repositorio se distingue por ser un artefacto educativo con dos adaptadores DPO y evidencia de evaluacion, no por un rendimiento medido.

## Limitaciones y advertencias

- Artefacto educativo: el autor indica explicitamente que no es un chatbot listo para produccion ni un asistente general evaluado con benchmarks.
- Evidencia insuficiente de mejora: las salidas de las tres configuraciones son a menudo similares y algunas contienen continuaciones irrelevantes, respuestas incompletas o errores de razonamiento; no se demuestra que ningun beta mejore de forma consistente la calidad.
- Evaluacion humana pendiente: la plantilla `human_ratings_template.csv` no esta cumplimentada; no deben reportarse puntuaciones sin valoraciones reales.
- Riesgo de alucinacion: inherente a un modelo de 0.5B; el alineamiento DPO no elimina este riesgo.
- Idioma: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Licencia no disponible: no se declara licencia para el repositorio del adaptador, lo que impide confirmar condiciones de uso comercial. El modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0 segun su publicacion original, pero conviene verificarlo.
- Carga de adaptadores: el repositorio contiene dos adaptadores en subcarpetas; el autor advierte que no debe asumirse que una carpeta con ambos pueda cargarse como un unico adaptador.
- Configuracion de generacion: el autor recomienda verificar de forma consistente los parametros de generacion y el comportamiento de parada antes de extraer conclusiones.
- Sesgos: no documentados en la informacion disponible; heredables del dataset UltraFeedback y del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ullahhafeez321/qwen-dpo-lab10
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de preferencias: https://huggingface.co/datasets/trl-lib/ultrafeedback_binarized
- Framework de alineamiento TRL: https://github.com/huggingface/trl
- Framework PEFT: https://github.com/huggingface/peft
