# WineryLabs/Winery-Qwen3.5-2B-GrandCru-GGUF

## Resumen

Winery Qwen3.5-2B-GrandCru es un "model soup" (fusión de pesos por media lineal ponderada) construido por WineryLabs a partir de tres fine-tunes de Qwen/Qwen3.5-2B, compilado con la herramienta Winery. Cada donante recibe un peso proporcional a su propia media de benchmarks: DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING (peso 70,3), DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact (68,3) y Goekdeniz-Guelmez/Josiefied-Qwen3.5-2B-gabliterated-v1 (67,2). El resultado es un modelo de 1.881.825.088 parámetros (1,88B) distribuido exclusivamente en formato GGUF.

El objetivo es consolidar en un único checkpoint lo mejor de tres líneas de ajuste distintas sobre la misma base: una variante orientada a razonamiento y sin censura (HERETIC), una variante "thinking" compacta (Polaris) y una variante abliterada (Josiefied). Según los datos del autor, la fusión mejora la media agregada (70,5) respecto al mejor donante individual (70,3) y de forma mucho más clara respecto al Qwen3.5-2B original (62,8), sobre todo en GSM8K.

Es relevante por su tamaño: con 2,0 GB en Q8_0 y 1,88B parámetros, está pensado para ejecutarse en portátiles y teléfonos mediante llama.cpp, Jan, LM Studio o la app Winery, sin necesidad de GPU dedicada. La licencia declarada es Apache 2.0 y el modelo es de tipo conversacional, sin datos publicados sobre longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); detalles de atencion y capas no disponibles |
| Parametros totales | 1.881.825.088 (1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 confirmado por el autor; otros niveles GGUF no documentados en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (segun la model card) |
| Formato de pesos | GGUF (libreria `gguf`; repo de 2,0 GB) |
| Tipo de modelo | Merge / model soup (relacion `merge`) |
| Pipeline | text-generation |
| Modelos base | Qwen/Qwen3.5-2B; DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING; DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact; Goekdeniz-Guelmez/Josiefied-Qwen3.5-2B-gabliterated-v1 |
| Herramienta de fusion | Winery (fusion compiler) |
| Descargas / likes | 28 descargas, 0 likes |

## Arquitectura y entrenamiento

No hay entrenamiento adicional: el modelo es el resultado de una media lineal de pesos. El autor documenta la receta exacta del compilador Winery:

```
name Winery Grand Cru
out q8_0
default linear 70.3,68.3,67.2
```

Es decir, cada donante se pondera con su propia media de benchmarks, de modo que el merge es una interpolacion ponderada de los tensores de los tres checkpoints, todos ellos derivados de la misma base Qwen3.5-2B. Al compartir arquitectura y tokenizer, la fusión es directa y no requiere alineacion de vocabulario ni destilacion.

Como innovacion practica destaca el propio flujo de "model soup" como alternativa de bajo coste al entrenamiento: no se consumen tokens nuevos ni se aplica RLHF/DPO en esta fase, se reaprovechan los ajustes ya existentes. Los donantes aportan, segun sus autores, capacidades de razonamiento tipo "thinking" (Polaris-HighIQ-Thinking-Compact), comportamiento sin censura/abliterado (HERETIC y Josiefied) y estilo de chat tipo Claude (HERETIC). La salida se exporta directamente en Q8_0.

## Capacidades

- Generacion de texto conversacional multi-turno (`-cnv` en llama.cpp), con plantilla de chat compatible con el ecosistema Qwen.
- Razonamiento y matematicas de tipo escolar: GSM8K de 76,7 en la evaluacion del autor, el mayor salto respecto a la base (58,3).
- Razonamiento de sentido comun y conocimiento general: MMLU 51,5, ARC-Challenge 83,3.
- Modo "thinking": los donantes incluyen variantes de razonamiento (Polaris-HighIQ-Thinking-Compact y HERETIC-UNCENSORED-THINKING); los benchmarks publicados se midieron con el modo thinking desactivado.
- Comportamiento poco restrictivo: dos de los donantes son abliterados/sin censura, por lo que el modelo rechaza menos peticiones que el Qwen original.
- Uso offline/local: compatible con llama.cpp, Jan, LM Studio y la app Winery.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado; la variante "thinking" del donante sugiere capacidad de cadena de pensamiento, pero no hay datos especificos.
- Vision, audio y otras modalidades: no disponibles (pipeline exclusivamente text-generation).
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).

## Casos de uso

- Asistente conversacional local en portatil: con 2,0 GB en Q8_0 y 1,88B parametros, se puede ejecutar con `llama-cli -m Winery-Qwen3.5-2B-GrandCru-Q8_0.gguf -cnv` en CPU o GPU integrada, sin conexion a internet ni coste de API.
- Inferencia en movil o dispositivos embebidos: el tamano permite cuantizaciones bajas y despliegue en telefono mediante la app Winery o builds de llama.cpp, util para asistentes personales offline.
- Tutoria de matematicas basicas y problemas aritmeticos: el 76,7 en GSM8K lo hace adecuado para resolver y explicar problemas paso a paso en entornos educativos de bajo recursos.
- Clasificacion y respuesta sobre conocimiento general: el 51,5 en MMLU permite tareas de pregunta-respuesta y filtrado tematico donde no se requiere un modelo grande.
- Generacion de texto creativo y redaccion asistida: el ajuste estilo Claude del donante HERETIC aporta un tono conversacional util para borradores, resumenes y reescritura en local.
- Prototipado rapido y evaluacion de merges: sirve como banco de pruebas para comparar recetas de model soup con el Qwen3.5-2B original usando el mismo harness.
- Investigacion sobre alineacion y censura: al integrar donantes abliterados, es un caso de estudio para medir el efecto del "abliterating" sobre tasas de rechazo y calidad de respuesta.
- Aplicaciones de escritorio con privacidad estricta: LM Studio o Jan permiten procesar datos sensibles sin salida a la nube, dado el tamano reducido del modelo.

## Benchmarks y rendimiento

Datos publicados por el autor (evaluacion local, 0-shot chat, thinking desactivado; MMLU con 200 preguntas, ARC-Challenge con 150 y GSM8K con 60, ejecutado con llama-server). El propio autor advierte que son muestras pequenas y que deben interpretarse como orientativas, no como resultados de leaderboard.

| Modelo | MMLU | ARC-C | GSM8K | Media |
|---|---|---|---|---|
| Winery Grand Cru (este) | 51,5 | 83,3 | 76,7 | 70,5 |
| Mejor donante (DavidAU HERETIC) | 54,5 | 81,3 | 75,0 | 70,3 |
| Qwen/Qwen3.5-2B (stock) | 51,5 | 78,7 | 58,3 | 62,8 |

Lectura de los datos: la fusion cede 3,0 puntos de MMLU frente al mejor donante, pero gana 2,0 en ARC-C y 1,7 en GSM8K, lo que eleva la media agregada. Frente a la base sin ajustar, la mejora es de +18,4 puntos en GSM8K y +4,6 en ARC-C, con MMLU identico. No hay datos de HumanEval, MT-Bench, ni de benchmarks multilingues.

## Requisitos de hardware

- Peso de los pesos en Q8_0: 2,0 GB (dato del autor). En otras cuantizaciones, la estimacion aritmetica a partir de 1,88B parametros es aproximadamente: Q6_K ~1,55 GB, Q5_K_M ~1,3 GB, Q4_K_M ~1,1 GB, Q3_K_M ~0,9 GB, Q2_K ~0,7 GB. A esas cifras hay que sumar la cache KV y el overhead del runtime (no documentados, porque se desconoce la longitud de contexto).
- VRAM estimada para inferencia: no disponible de forma oficial; en la practica, cualquier GPU con 3-4 GB libres cubre Q8_0 con contexto moderado, y 2 GB o menos bastan para Q4_K_M.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo no necesita A100 ni H100; es razonable en RTX 3060/4060 y superiores, y en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, con holgura. Practicamente cualquier GPU de consumo de los ultimos anos puede alojarlo, e incluso puede correr en CPU pura.
- Despliegue: llama.cpp (builds recientes con soporte de Qwen3.5), Jan, LM Studio y la app Winery, segun el autor. vLLM y TGI no estan mencionados; su soporte de GGUF y de esta arquitectura concreta es dudoso.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantizacion y del contexto efectivo.

## Comparativa con modelos similares

Comparacion con los modelos para los que la informacion proporcionada incluye datos. Se trata de alternativas de la misma categoria (misma base Qwen3.5-2B, ~2B parametros, orientadas a uso local).

| Modelo | Parametros | Formato | Contexto | Benchmarks (MMLU / ARC-C / GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Winery Grand Cru | 1,88B | GGUF (Q8_0) | No disponible | 51,5 / 83,3 / 76,7 | Apache 2.0 | HuggingFace, llama.cpp, Jan, LM Studio |
| DavidAU HERETIC (mejor donante) | ~2B (derivado de Qwen3.5-2B) | No disponible | No disponible | 54,5 / 81,3 / 75,0 | No disponible en la informacion | Repo del autor en HuggingFace |
| Josiefied gabliterated-v1 (donante) | ~2B | No disponible | No disponible | No disponible (peso 67,2 segun el autor) | No disponible en la informacion | Repo del autor en HuggingFace |
| Qwen/Qwen3.5-2B (stock) | ~2B | No disponible | No disponible | 51,5 / 78,7 / 58,3 | No disponible en la informacion | HuggingFace |

No se dispone de datos de otros modelos comparables de tamano similar (por ejemplo, alternativas de 1-3B de otras familias) en la informacion proporcionada, por lo que no se incluyen cifras que no se puedan respaldar.

## Limitaciones y advertencias

- Procedencia de los benchmarks: son mediciones propias del autor con muestras muy pequenas (200 preguntas de MMLU, 150 de ARC-C, 60 de GSM8K) y sin repetibilidad publicada. No son resultados de leaderboard y la varianza puede ser alta.
- Contenido sin censura: dos de los tres donantes son abliterados o "uncensored". El modelo rechaza menos peticiones que el Qwen original, lo que traslada al usuario la responsabilidad del uso y aumenta el riesgo de generar contenido inapropiado, ofensivo o danino.
- Riesgo de alucinacion: elevado por tamano. Con 1,88B parametros y 51,5 en MMLU, es esperable inventar hechos, citas y referencias en tareas de conocimiento general. No debe usarse como fuente de verdad sin verificacion.
- Longitud de contexto desconocida: no se documenta el contexto soportado. Si se despliega con una ventana mayor de la soportada por los pesos, la calidad puede degradarse sin aviso.
- Idiomas no documentados: se desconoce la cobertura multilingue y no hay evaluaciones fuera del ingles en los benchmarks presentados.
- Modo thinking: los benchmarks se midieron con thinking desactivado; no hay datos sobre la calidad o el coste del modo razonamiento de los donantes.
- Sin tool calling ni agentes documentados: no hay evidencia de soporte fiable de function calling; no conviene integrarlo en pipelines de agentes sin validacion previa.
- Licencia: la model card declara Apache 2.0, pero es un merge de cuatro modelos cuyas licencias individuales no se detallan en la informacion disponible. Conviene verificar las condiciones de cada donante antes de un uso comercial, especialmente las variantes derivadas de terceros.
- Adopcion marginal: 28 descargas y 0 likes en el momento del registro, sin comunidad que haya validado el comportamiento en produccion.
- Compatibilidad: requiere builds recientes de llama.cpp con soporte de Qwen3.5; en versiones antiguas el modelo puede no cargar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WineryLabs/Winery-Qwen3.5-2B-GrandCru-GGUF
- Organizacion WineryLabs en HuggingFace: https://huggingface.co/WineryLabs
- Herramienta Winery (fusion compiler): https://zo.pub/zandy/winery
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Donante DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Donante DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact: https://huggingface.co/DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact
- Donante Goekdeniz-Guelmez/Josiefied-Qwen3.5-2B-gabliterated-v1: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3.5-2B-gabliterated-v1
- Nota sobre la busqueda web: los resultados devueltos corresponden unicamente a enlaces de Instagram, sin relacion con el modelo. No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales en la busqueda realizada.
