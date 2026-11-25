# WITAJ-Sprachzentrum/Qwen2.5-1.5B_witaj_t2k_hs_hsb-dsb-de_2026-07-30

## Resumen

El modelo `Qwen2.5-1.5B_witaj_t2k_hs_hsb-dsb-de_2026-07-30` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct, desarrollado por el Witaj-Sprachzentrum (Domowina Bund Lausitzer Sorben e. V.) y entrenado por Hannah Seltmann para t2k GmbH. Su proposito es la traduccion automatica entre aleman y las dos lenguas sorbias: alto sorabo (hsb) y bajo sorabo (dsb), incluyendo traduccion directa entre ambas variedades sorbias.

El modelo resuelve un problema de nicho pero critico para la preservacion linguistica: las lenguas sorbias son lenguas minoritarias eslavas habladas en Lusacia (Alemania), con recursos digitales escasisimos. Un modelo de 1.500 millones de parametros ajustado especificamente para estas lenguas ofrece una alternativa ligera y desplegable a los grandes modelos multilingues, que suelen tener un rendimiento pobre en lenguas de bajos recursos. Se empleo en el traductor Sotra (sotra.app).

Tecnicamente, se trata de un transformer decoder-only denso de aproximadamente 1.540 millones de parametros, derivado de la familia Qwen2.5, con licencia CC BY-SA 4.0 y pesos en formato safetensors. El ajuste fino sigue el enfoque del sistema NRC presentado en la tarea compartida WMT2025-LRSL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | aleman (de), alto sorabo (hsb), bajo sorabo (dsb) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo rotary (RoPE). El ajuste fino no modifica la arquitectura base; se especializa el comportamiento del modelo hacia la traduccion mediante entrenamiento supervisado sobre pares de frases en las tres lenguas.

El entrenamiento sigue el enfoque descrito por Larkin et al. en "NRC Systems for the WMT2025-LRSL Shared Task" (WMT 2025), utilizando datos proporcionados por Witaj. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se invoca mediante una plantilla de chat con etiquetas estructuradas (`<hsb>...</hsb>`, `<dsb>...</dsb>`, `<de>...</de>`) que indican el idioma de origen y destino, lo que permite dirigir la traduccion entre cualquier par de las tres lenguas.

## Capacidades

- Traduccion de texto entre aleman, alto sorabo y bajo sorabo en cualquier direccion (de↔hsb, de↔dsb, hsb↔dsb).
- Generacion de traducciones en formato etiquetado mediante prompt estructurado con etiquetas de idioma.
- Conversacion multi-turno mediante la plantilla de chat heredada de Qwen2.5-Instruct.
- Manejo de frases y parrafos de longitud moderada (hasta `max_new_tokens=1024` en el ejemplo de la model card).
- Capacidades generales de lenguaje heredadas del modelo base (comprension lectora, generacion), aunque el ajuste fino esta orientado a traduccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion en el traductor Sotra: el modelo es el motor de traduccion de la aplicacion sotra.app, gestionando peticiones de traduccion entre aleman y sorabo en entornos de produccion.
- Preservacion linguistica digital: generacion de contenido en alto y bajo sorabo para publicaciones, senaletica o webs institucionales, donde apenas existen herramientas automaticas.
- Atencion al ciudadano en Lusacia: traduccion de comunicaciones administrativas alemanas a sorabo para servicios publicos bilingues de la region.
- Traduccion de material educativo: conversion de textos escolares o didacticos entre aleman y las variedades sorbias para escuelas del territorio sorabo.
- Traduccion entre variedades sorbias: paso directo de alto sorabo a bajo sorabo (y viceversa) sin intermediacion del aleman, util para comparativa dialectal y edicion.
- Despliegue ligero en local: con 1.500 millones de parametros puede ejecutarse en hardware modesto (incluida GPU de consumo) para integrarse en herramientas de escritorio o servicios internos.
- Investigacion en traduccion de lenguas de bajos recursos: punto de partida reproducible (enfoque WMT2025-LRSL) para experimentos con otras lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (2 bytes por parametro sobre 1.540 millones); en cuantizacion de 8 bits alrededor de 1,6 GB, y en 4 bits alrededor de 0,8 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; GPU profesionales como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-1.5B_witaj_t2k_hs_hsb-dsb-de | 1,54 B | no disponible | de, hsb, dsb | CC BY-SA 4.0 | Traduccion sorabo-aleman |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens (segun documentacion de Qwen; no verificado en esta ficha) | Multilingue amplio | Apache 2.0 | Instrucciones generales |
| Modelos NMT especializados (p. ej. Helsinki-NLP OPUS-MT) | variable (decenas de millones) | limitado | pares de lenguas concretos | variable | Traduccion neuronal dedicada |

La comparativa con OPUS-MT u otros sistemas NMT especializados no dispone de datos de rendimiento en la informacion proporcionada; no se puede afirmar superioridad sin benchmarks publicados.

## Limitaciones y advertencias

- Modelo de nicho: su rendimiento fuera de las tres lenguas objetivo no esta documentado y probablemente sea inferior al del base Qwen2.5-Instruct.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en frases largas o terminologia especializada.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento provienen de una institucion cultural concreta, lo que puede sesgar el registro y el vocabulario.
- Cobertura limitada: las lenguas sorbias tienen corpus pequenos; la calidad en dominios especializados (juridico, tecnico, medico) no esta verificada.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y compartir las obras derivadas bajo la misma licencia; esto puede condicionar la integracion en productos propietarios.
- Sin cuantizaciones oficiales ni benchmarks publicados: la evaluacion en produccion requiere validacion propia.
- El modelo se publico con muy pocas descargas y sin likes, por lo que no hay evidencia externa de robustez en uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WITAJ-Sprachzentrum/Qwen2.5-1.5B_witaj_t2k_hs_hsb-dsb-de_2026-07-30
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Traductor Sotra: https://sotra.app
- Codigo del servicio (repositorio indicado en la model card): https://github.com/WitajSotra/modele
- Paper de referencia (Larkin et al., WMT 2025): https://aclanthology.org/2025.wmt-1.87/
- Witaj-Sprachzentrum: https://www.witaj-sprachzentrum.de/
- t2k GmbH: https://www.text2knowledge.de/de
