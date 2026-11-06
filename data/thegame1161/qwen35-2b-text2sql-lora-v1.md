# Thegame1161/qwen35-2b-text2sql-lora-v1

## Resumen

Qwen3.5-2B Text-to-SQL LoRA v1 es un adaptador LoRA (PEFT) desarrollado por el usuario Thegame1161 sobre el modelo base Qwen/Qwen3.5-2B. Su proposito es convertir el modelo en un generador de consultas SQLite a partir de lenguaje natural, reduciendo drasticamente el coste de inferencia: en lugar de generar cadenas de razonamiento de aproximadamente 9.600 tokens como hace el modelo base en modo thinking, el adaptador produce razonamientos breves de unos 480 tokens antes de emitir una unica consulta SQL.

El adaptador se entrena sobre 10.000 ejemplos con cadena de pensamiento verificados por ejecucion, extraidos del dataset SynSQL-2.5M. La estrategia no busca superar al modelo base en una sola muestra, sino habilitar un bucle de muestreo multiple, reparacion por ejecucion y votacion que, con un presupuesto de tokens similar, mejora la precision del base. Con vote@8 y reparacion por ejecucion alcanza un 40,83 % de exactitud de ejecucion en BIRD dev y un 68,57 % en Spider dev.

Es relevante para equipos que necesitan text-to-SQL de bajo coste en produccion sobre SQLite, con un modelo pequeno (2B) que puede desplegarse en una sola GPU consumer o profesional, y que acepta un pipeline de reparacion y votacion para compensar su menor robustez en esquemas reales desordenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion lineal hibrida (Qwen3.5), adaptador LoRA sobre atencion y MLP |
| Parametros totales | No disponible para el adaptador; el modelo base es de 2B. El adaptador entrena 15,6M parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only con mecanismos de atencion lineal hibrida, segun los modulos objetivo del LoRA (q/k/v/o, `in_proj_qkv`, `in_proj_z`, `out_proj` y las capas MLP gate/up/down de las 24 capas). El LoRA usa r=16, alpha=32 y dropout 0,05, con 15,6M parametros entrenables. El entrenamiento se realizo con AdamW, learning rate 1e-4 con decaimiento coseno, una epoca (795 pasos) y perdida calculada unicamente sobre el target, en 1,6 horas de GPU en una RTX PRO 6000. La perdida en validacion bajo de 0,467 a 0,301.

Los datos de entrenamiento son 10.000 elementos de SynSQL-2.5M estratificados por complejidad (Simple 20 %, Moderate 35 %, Complex 30 %, Highly Complex 15 %). Cada SQL se ejecuto y se exigio que devolviera al menos una fila. El prompt se renderiza igual que en evaluacion (DDL del esquema, tres filas de ejemplo, pregunta, evidencia BIRD y una linea de instruccion) y el target es la cadena de pensamiento dentro de `` seguida de un bloque ```sql. No se menciona RLHF ni DPO. La innovacion principal es la destilacion de razonamiento corto: ensenar al modelo a razonar brevemente para abaratar la inferencia y permitir multiples muestras dentro del mismo presupuesto.

## Capacidades

- Generacion de consultas SQLite a partir de lenguaje natural, con el esquema proporcionado como DDL y filas de ejemplo.
- Razonamiento breve en modo thinking (aproximadamente 480 tokens generados por pregunta) antes de emitir la consulta.
- Soporte de evidencia adicional (campo evidence de BIRD) en el prompt.
- Generacion de una unica consulta SQL por respuesta, delimitada en un bloque de codigo ```sql.
- Compatible con bucles de muestreo multiple, ejecucion, reparacion y votacion (vote@8 + execution repair).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, vision ni audio especificas del adaptador.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite: el modelo traduce preguntas de negocio en SQL ejecutable usando el DDL y filas de ejemplo del esquema, adecuado para herramientas internas de analitica.
- Pipeline de text-to-SQL con reparacion: integrar el adaptador en un bucle que ejecute la consulta, detecte errores y regenere, aprovechando el bajo coste por muestra (unos 480 tokens) para permitir varias tentativas.
- Generacion de SQL en entornos con presupuesto de GPU limitado: al partir de un modelo de 2B con adaptador LoRA fusionable, puede servirse en una sola GPU consumer o profesional con vLLM tras fusionar los pesos.
- Votacion de multiples candidatos: generar 8 muestras por pregunta y seleccionar por consenso, lo que eleva la exactitud de ejecucion a 39,40 % en BIRD dev y 69,25 % en Spider dev.
- Prototipado rapido de interfaces de consulta en lenguaje natural: el adaptador permite validar un producto de text-to-SQL sobre SQLite antes de invertir en modelos mayores.
- Evaluacion comparativa de estrategias de razonamiento: sirve como referencia para medir el compromiso entre tokens generados y exactitud frente al modelo base en modo thinking.
- Educacion y formacion en SQL: generar consultas de ejemplo a partir de descripciones, con razonamiento breve que puede mostrarse al usuario.

## Benchmarks y rendimiento

Exactitud de ejecucion sobre SQLite, mismo prompt en todas las filas:

| Variante de Qwen3.5-2B | BIRD dev (1.533) | Spider dev (1.034) | Tokens generados por pregunta |
|---|---|---|---|
| Base, sin thinking | 22,24 % | 46,62 % | ~80 |
| Base, thinking, 1 muestra | 33,46 % | 64,12 % | ~9.600 |
| Este adaptador, 1 muestra | 25,51 % | 60,15 % | ~480 |
| Este adaptador, vote@8 | 39,40 % | 69,25 % | No disponible |
| Este adaptador, vote@8 + reparacion por ejecucion | 40,83 % | 68,57 % | ~4.900 |

Referencia externa citada en la model card: XiYanSQL-QwenCoder-3B, entrenado sobre los conjuntos de entrenamiento de BIRD/Spider, obtiene 52,19 % en BIRD y 85,20 % en Spider en el mismo entorno de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 2B, la huella es reducida y depende de la cuantizacion aplicada al modelo fusionado.
- GPU recomendadas: el entrenamiento se realizo en una RTX PRO 6000; para inferencia se menciona vLLM tras fusionar el adaptador. No se detallan modelos concretos adicionales.
- GPU consumer: no se confirma explicitamente, pero un modelo de 2B es compatible con GPUs consumer habituales segun el tamano; el dato concreto no esta disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM con los pesos fusionados (recomendado por el autor); PEFT + Transformers para cargar el adaptador sin fusionar. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta el coste en tokens generados por pregunta (~480 con una muestra, ~4.900 con vote@8 y reparacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD dev | Spider dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (vote@8 + reparacion) | Base 2B + LoRA 15,6M | No disponible | 40,83 % | 68,57 % | Apache-2.0 | Hugging Face (PEFT) |
| Qwen3.5-2B base con thinking, 1 muestra | 2B | No disponible | 33,46 % | 64,12 % | Apache-2.0 | Hugging Face |
| XiYanSQL-QwenCoder-3B | 3B | No disponible | 52,19 % | 85,20 % | No disponible en la informacion | No disponible en la informacion |

## Limitaciones y advertencias

- La exactitud con una sola muestra en BIRD (25,51 %) es inferior a la del modelo base con thinking (33,46 %): el razonamiento corto no revisa esquemas reales desordenados y a veces inventa nombres de columna.
- El uso previsto requiere el bucle de muestreo, ejecucion, reparacion y votacion; usarlo con una sola muestra degrada la calidad frente al base.
- Solo soporta preguntas en ingles y el dialecto SQLite.
- Riesgo de alucinacion de columnas o tablas inexistentes, especialmente en esquemas complejos o mal documentados.
- No se documentan sesgos especificos del adaptador; hereda los del modelo base Qwen3.5-2B.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset SynSQL-2.5M.
- No se dispone de datos sobre longitud de contexto, cuantizaciones soportadas ni latencia en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thegame1161/qwen35-2b-text2sql-lora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Paper de OmniSQL/SynSQL: https://arxiv.org/abs/2503.02240
- Benchmark BIRD: https://bird-bench.github.io/
- Benchmark Spider: https://yale-lily.github.io/spider
- Repositorio GitHub del proyecto: no disponible como URL directa en la informacion proporcionada (la model card menciona `src/vote_repair.py` y `src/prompts.py`)
