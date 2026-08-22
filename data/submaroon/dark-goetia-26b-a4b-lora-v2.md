# SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2

## Resumen

Dark-Goetia-26B-A4B-LoRA-v2 es un adaptador LoRA de estilo narrativo desarrollado por SubMaroon, disenado para roleplay de fantasia oscura (Dark Fantasy) en ingles principalmente, con soporte secundario en ruso. Se monta sobre el modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, un Gemma 4 MoE de 26.000 millones de parametros totales con 4.000 millones activos, abliterado (sin rechazos de contenido). El adaptador anade un tono mas oscuro y literario a la narrativa sin introducir tramas ni personajes propios del dataset de entrenamiento.

Entrenado con QLoRA de 4 bits exclusivamente sobre las proyecciones de atencion (q/k/v/o_proj) de las 30 capas del tower de texto, el adaptador tiene 22.978.560 parametros entrenables (0,089% del modelo base). El dataset se genero a partir de una novela descompuesta en escenas y reescrita por una red neuronal como dataset sintetico de roleplay, preservando acciones y pensamientos internos pero eliminando el estilo de prosa del autor original. El repositorio incluye dos versiones del adaptador: main (2 epocas) y chk177 (1 epoca).

La relevancia de este adaptador radica en su enfoque quirurgico: en lugar de ajustar el modelo completo, modifica selectivamente la atencion para cambiar el estilo de escritura. El analisis de normas de Frobenius del delta efectivo muestra que aproximadamente el 61% del cambio se concentra en la via OV (output-value) y el 39% en la via QK (query-key), lo que permite a los usuarios ajustar la intensidad del efecto mediante un parametro de escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 4 MoE (base: Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA) |
| Parametros totales | 22.978.560 (adaptador, 0,089% del base); 26B (modelo base) |
| Parametros activos | 4B (modelo base, arquitectura MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | QLoRA 4-bit (entrenamiento); version GGUF disponible |
| Idiomas soportados | ingles (principal), ruso |
| Licencia | Gemma |
| Formato de pesos | PEFT/safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA de 4 bits sobre un subconjunto especifico de capas: las proyecciones de atencion q, k, v y o de las 30 capas del tower de texto del modelo base. En total son 115 proyecciones, no 120, porque las capas 5, 11, 17, 23 y 29 son capas de atencion global que no tienen proyeccion v_proj. Los hiperparametros son r=32, alpha=64, 2 epocas (version main) y loss solo sobre completions. La version chk177 se entreno durante 1 epoca y requiere multiplicar la escala recomendada por 1,5.

El dataset de entrenamiento se construyo a partir de una novela descompuesta en escenas, que fueron reescritas por una red neuronal para convertirlas en un dataset sintetico de roleplay. Se preservaron las acciones y los pensamientos internos de los personajes, pero se elimino el estilo de prosa del autor original. El dataset contiene muestras en ingles y ruso, con predominio del ingles.

Un aspecto tecnico destacable es el analisis de la distribucion del delta entrenado. Las normas de Frobenius del delta efectivo ΔW = (B·A)·(alpha/r), agregadas por capas, muestran:

| Proyeccion | ‖ΔW‖ |
|---|---|
| o_proj | 1,563 |
| q_proj | 1,314 |
| v_proj | 1,049 |
| k_proj | 0,828 |
| Total OV | 1,882 |
| Total QK | 1,553 |
| Delta completo | 2,440 |

Esto significa que aproximadamente el 61% del cambio se concentra en la via OV y el 39% en la via QK. La via OV transporta casi todo el estilo, mientras que ambas vias contribuyen de forma independiente a la degradacion del formato estructurado, siendo OV unas 3 veces mas propensa a causar degradacion por unidad de cambio de peso.

## Capacidades

- Generacion de narrativa de roleplay con tono oscuro y literario, especificamente en escenarios de fantasia oscura.
- Ajuste de estilo y estructura de respuesta en conversaciones de roleplay de multiples turnos.
- Soporte bilingue: optimizado para ingles, con funcionamiento aceptable en ruso (aunque el efecto de estilo es mas debil y el seguimiento de instrucciones mas fragil).
- Integracion con SillyTavern mediante preset de Marinara, con tarjetas de personaje de mas de 2000 tokens.
- Control fino de la intensidad del estilo mediante parametro de escala: 0,3-0,55 en prosa libre; hasta 0,40 en ingles y 0,37 en ruso para salidas estructuradas.
- No introduce tramas ni personajes del dataset de entrenamiento: el adaptador solo ajusta el estilo.
- Version GGUF disponible con metadatos alpha/r=2 almacenados, que llama.cpp multiplica sobre la escala configurada.

## Casos de uso

- Roleplay de fantasia oscura en SillyTavern: el adaptador se carga como LoRA sobre el modelo base y se ajusta la escala entre 0,3 y 0,55 para obtener un estilo narrativo estable y controlado en sesiones completas de roleplay con tarjeta de personaje y system prompt.
- Escritura narrativa literaria: el tono mas oscuro y literario es especialmente pronunciado en escenarios de fantasia oscura, lo que lo hace util para generar prosa con ambientacion gotica o sombria.
- Sesiones de roleplay bilingues ingles-ruso: aunque el efecto es mas debil en ruso, el adaptador funciona en ambos idiomas; para sesiones mixtas se recomienda ajustar la escala al limite ruso (0,37 para salidas estructuradas).
- Experimentacion con analisis de atencion: el desglose detallado de normas de Frobenius por proyeccion (OV vs QK) permite a investigadores estudiar como los adaptadores LoRA modifican selectivamente los mecanismos de atencion.
- Personalizacion de modelos de roleplay: los adaptadores v3-A y v3-B dividen el conjunto de objetivos en dos mitades no solapadas, permitiendo aislar el canal de estilo (v_proj + o_proj) del componente QK para casos de uso que requieren formato estricto.
- Despliegue con llama.cpp: la version GGUF permite cargar el adaptador en entornos de inferencia locales con llama.cpp, aprovechando la metainformacion alpha/r=2 almacenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Al tratarse de un adaptador de estilo, el autor proporciona en su lugar mediciones de calidad subjetiva y limites de escala medidos empiricamente:

| Regimen | Escala segura | Primera falla observada |
|---|---|---|
| Prosa libre (ingles) | 0,3-0,55 | 0,55+ (el estilo empieza a dominar al modelo base) |
| Salida estructurada (ingles) | hasta 0,40 | por encima de 0,43 (estimado) |
| Salida estructurada (ruso) | hasta 0,37 | 0,40 |

Estas mediciones se realizaron con una sola generacion por configuracion y a una profundidad de contexto unica, por lo que deben tratarse como puntos de partida calibrados, no como constantes absolutas.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB (tamano del repositorio) y anade 22,9 millones de parametros al modelo base, por lo que el requisito de hardware viene determinado principalmente por el modelo base Goetia-26B-A4B-v1.3.
- El modelo base es un MoE de 26B parametros totales con 4B activos. En FP16 se estiman unos 52 GB de VRAM (una entrada relacionada en LLM Explorer para un modelo fusionado similar indica 51,6 GB); con cuantizacion de 4 bits, el modelo cabe en GPUs de consumo de 16-24 GB como la RTX 4090.
- La version GGUF del adaptador esta disponible para su uso con llama.cpp, que soporta cargas de LoRA sobre modelos cuantizados.
- Opciones de despliegue: llama.cpp (via GGUF), SillyTavern con preset de Marinara, y plataformas de inferencia como FriendliAI que ofrecen API de baja latencia.
- No se dispone de datos de latencia o throughput medidos para este adaptador especifico.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Proyecciones objetivo | Uso previsto |
|---|---|---|---|---|
| Dark-Goetia-26B-A4B-LoRA-v2 | LoRA completo | 22.978.560 | 115 (q, k, v, o) | Estilo + formato en roleplay |
| v3-A | LoRA experimental | no disponible | 55 (v, o) | Solo canal de estilo, mejor tolerancia a formato estricto |
| v3-B | LoRA experimental | no disponible | 60 (q, k) | Artefacto de investigacion, estilo debil |
| Goetia-26B-A4B-v1.3 (base) | Modelo completo | 26B | — | Modelo base sin ajuste de estilo |

Los adaptadores v3-A y v3-B dividen el conjunto de objetivos de v2 en dos mitades no solapadas, entrenadas con datos e hiperparametros identicos y la misma semilla. La suma de ambos equivale exactamente al conjunto de objetivos y presupuesto de parametros de v2.

## Limitaciones y advertencias

- Contenido 18+: el modelo base esta abliterado y los datos de entrenamiento incluyen contenido adulto y oscuro.
- Optimizado principalmente para ingles; en ruso el efecto de estilo es mas debil y el seguimiento de instrucciones mas fragil.
- Los limites de salida estructurada se midieron con una sola generacion por configuracion y a una profundidad de contexto unica; deben tratarse como puntos de partida calibrados, no como constantes.
- Por encima de las escalas recomendadas, el adaptador puede empezar a dominar al modelo base y degradar el formato estructurado (especialmente en ruso).
- Si el cargador ignora la metainformacion alpha/r=2 almacenada en el GGUF, las escalas recomendadas deben dividirse por la mitad.
- Hereda los terminos de la licencia Gemma del modelo base.
- El adaptador no contiene tramas ni personajes del dataset de entrenamiento, pero el dataset original incluye contenido adulto y oscuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2
- Version GGUF: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA
- Adaptador v3-A: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-A
- Adaptador v3-B: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v3-B
- Preset de Marinara: https://github.com/SpicyMarinara/SillyTavern-Settings/blob/main/Marinara%27s%20Essentials/Preset/Marinara%27s%20Spaghetti%20Recipe.json
- Pagina en LLM Explorer: https://llm-explorer.com/model/SubMar
