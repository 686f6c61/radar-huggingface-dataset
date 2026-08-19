# VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-3bit

## Resumen

Este checkpoint es una cuantizacion DynQuant de 3 bits del modelo bf16 `VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16`, que a su vez deriva del componente Thinker de Qwen3-Omni-30B-A3B. El autor, VikramPal, lo publica explicitamente como un artefacto de investigacion de resultado negativo: el checkpoint esta roto a proposito y no debe usarse para inferencia. Obtiene un 25,00 % de acierto (125/500) en la tarea de clasificacion de 60 vias sobre el dataset SLURP, frente al 86,80 % del modelo bf16 del que se cuantizo. El objetivo de publicarlo es medir el dano causado por un ajuste de cuantizacion que fija un presupuesto de bits por debajo del minimo exigido por los "floors" por rol del asignador DynQuant, y servir como control para que terceros puedan verificar ese mecanismo de fallo.

El modelo es una variante MoE (mixture of experts) con 96 bancos de expertos, y solo incluye el componente Thinker: acepta audio, imagen, video y texto como entrada, pero emite unicamente texto, sin salida de voz. El repositorio pesa 11,9 GB y los safetensors contienen 3.224.977.040 parametros, una cifra muy inferior a los 31.719.205.488 que declara la model card para el Thinker completo; esta discrepancia no esta explicada en la documentacion disponible. La carga requiere el paquete `dynquant` 0.4.0 y una llamada explicita a `dynquant.register_hf_quantizer()` antes de `from_pretrained`, ademas de `transformers>=5.15`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3OmniMoeThinkerForConditionalGeneration) |
| Parametros totales | 3.224.977.040 (segun safetensors; la model card declara 31.719.205.488 para el Thinker completo) |
| Parametros activos | no disponible (arquitectura MoE, pero no se especifica el numero de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 3 bits (cuantizacion mixta por modulo, con 400 de 650 modulos en estado "breached") |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (declarada en el campo `license_name`; el YAML principal indica `other`) |
| Formato de pesos | safetensors (con `quantization_config` de tipo `dynquant`) |

## Arquitectura y entrenamiento

El modelo se basa en el componente Thinker de Qwen3-Omni-30B-A3B, una arquitectura MoE con 96 bancos de expertos que concentran el 91,399 % de los parametros del Thinker (28.991.029.248 de 31.719.205.488). Los 48 routers se des-cuantizan a denso por diseno, mientras que 504 lineales, 2 embeddings y 96 bancos de expertos se cuantizan con DynQuant. El checkpoint excluye por completo los componentes Talker y code2wav (3.540.613.057 parametros), que fueron anulados antes del entrenamiento.

El entrenamiento se realizo mediante QLoRA sobre el dataset SLURP (`marcel-gohsen/slurp`), una tarea de clasificacion de intenciones de 60 clases. El modelo bf16 resultante alcanzo un 86,80 % de accuracy. La cuantizacion a 3 bits se ejecuto con DynQuant 0.4.0, que asigna anchos de bits por modulo contra un presupuesto de bytes sujeto a "floors" minimos por rol. En esta arquitectura, los floors por rol cuestan 3,418 bits promedio, por lo que un objetivo de 3,00 bits queda por debajo del presupuesto minimo: los floors no pueden satisfacerse, se activan los floors blandos y el asignador degrada 400 de 650 modulos por su menor retorno de inversion. El resultado es una perdida catastrofica de rendimiento (25,00 % frente al 86,80 % del bf16), mientras que la variante de 4 bits, con 0,582 bits de margen sobre los floors, mantiene un 86,20 %.

## Capacidades

- Acepta entradas multimodales: audio, imagen, video y texto.
- Emite unicamente texto; no hay salida de voz (no es un modelo speech-to-speech).
- Clasificacion de intenciones en el dominio SLURP (60 clases), aunque con rendimiento degradado a 25,00 %.
- El checkpoint esta roto a proposito: el autor lo marca como `not-for-inference` y `negative-result`.
- Requiere `dynquant.register_hf_quantizer()` antes de `from_pretrained`; si no se registra, transformers carga un modelo aleatorio que genera texto fluido pero sin sentido.
- `AutoModelForCausalLM` y `AutoModel` fallan; debe usarse `Qwen3OmniMoeThinkerForConditionalGeneration` o `AutoModelForImageTextToText`.

## Casos de uso

Este modelo no tiene casos de uso practicos de produccion. El autor lo publica exclusivamente como artefacto de investigacion y control experimental. Los unicos escenarios en los que tiene sentido utilizarlo son:

- Estudio del efecto de la cuantizacion agresiva: permite medir cuantitativamente el dano que produce fijar un presupuesto de bits por debajo de los floors minimos del asignador DynQuant, comparando el 25,00 % con el 86,80 % del bf16 y el 86,20 % del 4-bit.
- Validacion de mecanismos de fallo en cuantizacion: sirve para verificar que el colapso se debe al floor-override y no a un error de carga, contando los 602 modulos DynQuant esperados (504 lineales + 2 embeddings + 96 bancos de expertos) frente a 0 en una carga fallida.
- Desarrollo de heuristicas de presupuesto: los datos de este checkpoint pueden usarse para calibrar reglas que impidan que un objetivo de cuantizacion quede por debajo del coste minimo de los floors por rol.
- Reproducibilidad de resultados negativos: permite a otros investigadores comprobar de forma independiente la hipotesis del autor sobre el mecanismo de degradacion.
- Benchmarking de herramientas de cuantizacion: sirve como caso limite para probar el comportamiento de DynQuant y de transformers ante configuraciones de cuantizacion invalidas.
- Educacion en ingenieria de modelos: ilustra de forma concreta por que un checkpoint cuantizado puede estar roto sin que el proceso de carga falle, y como distinguir un fallo de carga de un fallo de cuantizacion.

## Benchmarks y rendimiento

El unico benchmark publicado es la tarea de clasificacion de 60 vias sobre SLURP, con los siguientes resultados:

| Variante | Accuracy | Notas |
|---|---|---|
| bf16 (modelo base) | 86,80 % | Modelo original sin cuantizar |
| DynQuant 4 bits | 86,20 % | 14,77 GiB, sin separarse del techo bf16 |
| DynQuant 3 bits (este modelo) | 25,00 % (125/500) | Por encima del azar (1,667 %) pero inutil; 3 de 500 generaciones no parseables |

No se han publicado resultados en otros benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Tamano del repositorio: 11,9 GB (el autor indica 11,08 GiB), por lo que el checkpoint cabe en GPUs consumer con al menos 12 GB de VRAM, aunque el modelo esta roto y no se recomienda su uso.
- Software necesario: `dynquant` 0.4.0, `transformers>=5.15,<6`, `accelerate` y `torch`. Es imprescindible ejecutar `dynquant.register_hf_quantizer()` antes de `from_pretrained`.
- GPU recomendadas: no disponible; al estar roto, no hay recomendacion de despliegue.
- Opciones de despliegue: no recomendado. El autor senala que la variante 4-bit del mismo repositorio es la unica utilizable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (safetensors) | Cuantizacion | Accuracy SLURP | Licencia | Uso |
|---|---|---|---|---|---|
| VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16 | 31.719.205.488 (Thinker) | bf16 | 86,80 % | Apache 2.0 | Inferencia valida |
| VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit | no disponible | DynQuant 4 bits | 86,20 % | Apache 2.0 | Inferencia valida (texto solo) |
| VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-3bit (este) | 3.224.977.040 | DynQuant 3 bits | 25,00 % | Apache 2.0 | Roto, solo investigacion |

No se dispone de datos de comparacion con el Qwen3-Omni-30B-A3B-Instruct original de Qwen, ya que no se han publicado resultados de este checkpoint en los benchmarks de ese modelo.

## Limitaciones y advertencias

- El checkpoint esta roto a proposito y el autor lo marca explicitamente como `not-for-inference`. No debe usarse en ningun entorno de produccion.
- Obtiene un 25,00 % de accuracy en la unica tarea para la que fue construido, frente al 86,80 % del modelo bf16. Esta por encima del azar (1,667 %) pero es inutil para cualquier aplicacion real.
- Si no se ejecuta `dynquant.register_hf_quantizer()` antes de `from_pretrained`, transformers no lanza error: carga un modelo aleatorio que genera texto fluido pero sin sentido. Esto puede confundirse con el fallo real del checkpoint.
- Solo emite texto; no hay salida de voz, aunque acepta entradas multimodales.
- Solo soporta ingles.
- La cuantizacion a 3 bits viola los floors minimos del asignador DynQuant (3,418 bits promedio), lo que provoca que 400 de 650 modulos esten en estado "breached". Este mecanismo es la causa documentada del colapso.
- Los parametros totales en safetensors (3.224.977.040) no coinciden con los declarados para el Thinker completo (31.719.205.488); no se explica esta discrepancia en la documentacion.
- Requiere versiones muy recientes de transformers (>=5.15) y el paquete `dynquant` 0.4.0, lo que limita su reproducibilidad en entornos estandar.
- No se han publicado resultados en benchmarks generales (MMLU, HumanEval, etc.), por lo que no es posible evaluar su rendimiento fuera de la tarea SLURP.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-3bit
- Modelo base bf16: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16
- Variante 4-bit recomendada por el autor: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit
- Repositorio de DynQuant: https://github.com/kambojvikram/dynquant
- Dataset SLURP: https://huggingface.co/datasets/marcel-gohsen/slurp
