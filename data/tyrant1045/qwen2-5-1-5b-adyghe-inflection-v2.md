# tyrant1045/qwen2.5-1.5b-adyghe-inflection-v2

## Resumen

El modelo `qwen2.5-1.5b-adyghe-inflection-v2` es un adaptador QLoRA publicado por el usuario tyrant1045 sobre la base `unsloth/Qwen2.5-1.5B-Instruct`. No es un modelo de propósito general: es un adaptador especializado en una única tarea de morfología del adigué (código ISO `ady`), una lengua caucásica noroccidental escrita en cirílico. Concretamente, recibe un lema (sustantivo o adjetivo) y un conjunto de etiquetas morfológicas en el formato UniMorph, y devuelve únicamente la forma flexionada resultante.

La relevancia del modelo es acotada pero clara: demuestra que un ajuste fino ligero (LoRA de rango 16 sobre un modelo de 1.500 millones de parámetros) puede superar a modelos frontera con prompting few-shot en una tarea morfológica de una lengua de bajos recursos. En la evaluación del autor, el adaptador alcanza un 90,0% de acierto exacto en el conjunto `inf_eval`, frente al 80,0% del mejor modelo frontera evaluado con prompting. Sobre 1.706 filas de test congeladas (166 lemas no vistos) reporta un 93,85% de coincidencia exacta.

El repositorio pesa 0,1 GB y contiene solo los pesos del adaptador en formato PEFT/safetensors, no los pesos completos del modelo base. La licencia es CC BY-SA 3.0, heredada de los datos de entrenamiento derivados de UniMorph y Wiktionary. El modelo tiene un uso muy específico y no está pensado como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA/QLoRA superpuesto |
| Parametros totales | no disponible (adaptador LoRA sobre base de 1,5B; el repo solo contiene los pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4 bits (bnb-4bit) sobre la base; el adaptador se distribuye en safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | adigué (`ady`) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Tamano del repo | 0,1 GB |
| Libreria | peft |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit |
| Hiperparametros LoRA | r=16, alpha=16, lr=2e-4, batch=16, 1 epoch, seed=3407 |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre `unsloth/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5 con 1.500 millones de parámetros, cuantizado a 4 bits para el ajuste. El adaptador LoRA usa rango 16 y alpha 16, con tasa de aprendizaje 2e-4, tamaño de lote 16 y una sola época. El entrenamiento se hizo con Unsloth, lo que explica el bajo coste computacional del ajuste.

Los datos de entrenamiento son 27.561 filas construidas a partir de UniMorph para el adigué, con datos provenientes de Wiktionary bajo CC BY-SA 3.0. La división train/test se hace por lema, de modo que ningún lema del conjunto de test aparece en entrenamiento, lo que evita fuga de información morfológica. La versión v2 repite filas de lemas terminados en `-у` y filas de casos INS y ERG con raíz consonántica para corregir un problema de pérdida de la `э` de enlace. No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida.

La innovación técnica principal no está en la arquitectura sino en el planteamiento de la tarea: formatear la flexión morfológica como una transformación texto-a-texto con etiquetas UniMorph explícitas y evaluar con coincidencia exacta más un juez LLM. El autor documenta también una debilidad clara: el adaptador es frágil al formato del prompt y cae al 46,7% si se reordenan las etiquetas o se cambia la instrucción.

## Capacidades

- Flexión de sustantivos y adjetivos en adigué a partir de un lema y etiquetas UniMorph.
- Manejo de las categorías morfológicas N, ADJ, NOM, ERG, INS, LGSPEC1, SG, PL, DEF y NDEF.
- Salida restringida a la forma flexionada, sin texto adicional (comportamiento esperado según la especificación).
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct, aunque no es el objetivo del adaptador.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documenta capacidad multilingüe más allá del adigué.
- No se documenta visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis morfológico en pipelines de PLN para adigué: dado un lema y un conjunto de rasgos, el adaptador genera la forma flexionada, lo que permite construir paradigmas y tablas de flexión de forma automatizada.
- Enriquecimiento de diccionarios y lexicones: generar formas flexionadas para entradas de Wiktionary o UniMorph y ampliar la cobertura de formas atestiguadas.
- Corrección y normalización ortográfica: comprobar si una forma flexionada generada coincide con la forma canónica esperada, útil en herramientas de revisión.
- Sistemas de aprendizaje de lenguas: generar ejercicios de flexión y respuestas de referencia para estudiantes de adigué.
- Evaluación comparativa de modelos en lenguas de bajos recursos: el adaptador sirve como referencia de hasta dónde llega un ajuste LoRA barato frente a modelos frontera con prompting.
- Preprocesado para traducción automática o análisis sintáctico: normalizar lemas a formas flexionadas antes de alimentar un analizador o un traductor.
- Investigación en morfología computacional: banco de pruebas reproducible para estudiar la fragilidad de los adaptadores ante variaciones de prompt.

## Benchmarks y rendimiento

| Modelo | Spec (inf_eval) | Robustez (inf_robust) |
|---|---|---|
| Qwen2.5-1.5B-Instruct base | 0,0% | 0,0% |
| Este adaptador (v2) | 90,0% | 46,7% |
| Mejor modelo frontera con prompting few-shot (gpt-6.1-sol) | 80,0% | 80,0% |

Sobre 1.706 filas de test congeladas (166 lemas no vistos): 93,85% de coincidencia exacta. Una búsqueda por reglas obtiene 97,48% en las mismas filas. Las evaluaciones se hicieron con 30 ítems por conjunto, juez LLM y comprobador de coincidencia exacta. El autor advierte que el adaptador es frágil al formato del prompt: con etiquetas en otro orden y otra instrucción baja al 46,7%.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct debe cargarse aparte.
- VRAM estimada para inferencia: aproximadamente 3-4 GB en 4 bits, 3-4 GB en FP16 para un modelo de 1,5B (cálculo orientativo, no confirmado en la model card).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4-6 GB de VRAM.
- Despliegue: compatible con la librería `peft`; puede servirse con vLLM, TGI o llama.cpp tras fusionar el adaptador con la base y convertir a GGUF. No se documentan opciones específicas en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (v2) | 1,5B (base) + LoRA r16 | no disponible | Flexión adigué | CC BY-SA 3.0 | HuggingFace, 24 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible | Generación general | no disponible en la informacion | HuggingFace |
| gpt-6.1-sol (few-shot) | no disponible | no disponible | Flexión adigué con prompting | propietaria | API |
| Búsqueda por reglas (referencia del autor) | no aplica | no aplica | Flexión adigué | no disponible | Código del autor |

No se dispone de comparativas con otros adaptadores morfológicos para lenguas caucásicas en la información proporcionada.

## Limitaciones y advertencias

- Fragilidad al formato del prompt: con etiquetas reordenadas o instrucciones distintas, el rendimiento cae del 90,0% al 46,7%. Es imprescindible usar el formato documentado.
- Cobertura limitada a sustantivos y adjetivos; no se documenta flexión verbal ni otras categorías.
- Dependencia de la ortografía cirílica y de la normalización de la palochka (`ӏ`); el autor indica que la evaluación normaliza I, l, 1 y | a `ӏ`.
- Sesgos y alucinaciones: no documentados explícitamente, pero al ser un modelo generativo puede producir formas no atestiguadas; el autor recomienda validar con el comprobador de coincidencia exacta.
- Licencia CC BY-SA 3.0: permite uso comercial con atribución y compartir bajo la misma licencia; conviene revisar las obligaciones de la licencia heredada de UniMorph y Wiktionary.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base para usarlo.
- El tamaño de los conjuntos de evaluación (30 ítems) es reducido, por lo que las cifras deben tomarse con cautela.
- No hay datos publicados sobre latencia, throughput ni comportamiento en producción.

## Enlaces

- HuggingFace: https://huggingface.co/tyrant1045/qwen2.5-1.5b-adyghe-inflection-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- UniMorph: https://unimorph.github.io
- Código de evaluación: carpeta `code/` del repositorio, commit 55a337e96415e3673092882701176e410d7bdcc7 (resultados con commit ad94dd448cff451f04c2d7d397428fd38ca46552)
