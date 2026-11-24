# vicstern/PRISMA-Models

## Resumen

PRISMA-Models es una familia de pesos publicada por el usuario vicstern en Hugging Face, distribuida en formato GGUF y derivada de un checkpoint "abliterated" de HauhauCS sobre una arquitectura base que el autor identifica como Qwen3.5/3VL/Gemma-4. El repositorio contiene 7.518.069.290 parametros totales según los metadatos de safetensors, lo que lo situa en la categoria de modelos de aproximadamente 7.500 millones de parametros, y ocupa 20 GB en el repositorio. La licencia declarada es Apache 2.0.

El modelo se presenta explicitamente como un ajuste "calibrado para narrativas educativas informadas en trauma sin rechazos de seguridad falsos". Es decir, el autor ha aplicado tecnicas de abliteration (ablacion de direcciones de rechazo en el espacio de activaciones) para reducir las negativas del modelo ante contenido sensible, orientandolo a contextos educativos y de acompanamiento. Esta es una practica controvertida que elimina capas de alineamiento de seguridad y tiene implicaciones directas para el uso en produccion.

La relevancia del modelo es limitada y debe evaluarse con cautela: cuenta con 2 descargas y 0 likes en el momento de la consulta, no dispone de pipeline declarado, no especifica idiomas soportados y la model card es extremadamente escueta. La informacion disponible no permite verificar el proceso de entrenamiento, los datos utilizados ni resultados de evaluacion. Los tags incluyen `gguf`, `imatrix`, `endpoints_compatible` y `conversational`, lo que sugiere un uso orientado a inferencia cuantizada y despliegue conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base declarada: Qwen3.5/3VL/Gemma-4, checkpoint HauhauCS abliterated) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tag `gguf`, `imatrix`); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 20 GB); safetensors referenciado en metadatos de parametros |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura transformer decoder-only heredada de un checkpoint base que el autor describe como Qwen3.5/3VL/Gemma-4, sin aclarar cual de las tres familias es la efectiva ni si se trata de una mezcla o de una denominacion ambigua. Sobre ese checkpoint se ha aplicado un proceso de abliteration por parte de HauhauCS, consistente en identificar y ablacionar las direcciones de activacion asociadas a rechazos de seguridad, y posteriormente una calibracion orientada a narrativas educativas informadas en trauma.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o fine-tuning supervisado, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El tag `imatrix` sugiere que las cuantizaciones GGUF se generaron con matrices de importancia (importance matrix) para preservar calidad en la cuantizacion, una practica habitual en llama.cpp. No hay publicada ninguna descripcion del pipeline de calibracion ni del dataset educativo utilizado.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Razonamiento y generacion de codigo: esperable por herencia de la arquitectura base de ~7.500 millones de parametros, aunque no verificado ni documentado por el autor.
- Capacidades multimodales (vision): la denominacion "3VL" en la arquitectura base sugiere un componente vision-language, pero no se confirma en la model card ni en los tags.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.
- Modo thinking explicito: no documentado.
- Comportamiento "sin rechazos de seguridad falsos" en contextos de trauma y educacion, segun la calibracion declarada por el autor.

## Casos de uso

- Formacion de profesionales en intervencion en trauma: el modelo se ha calibrado especificamente para narrativas educativas informadas en trauma, de modo que puede generar materiales formativos y escenarios de rol sin bloqueos ante terminologia clinica sensible.
- Simulacion de conversaciones para entrenamiento de terapeutas: permite generar dialogos multi-turno con contenido emocional delicado, util para practicar entrevistas y protocolos de contencion en entornos controlados.
- Generacion de material didactico sobre salud mental: redaccion de guiones, casos de estudio y fichas formativas donde el vocabulario clinico puede disparar rechazos en modelos alineados de forma estricta.
- Prototipado de asistentes conversacionales especializados: gracias a su formato GGUF y al tag `endpoints_compatible`, puede desplegarse rapidamente en entornos de prueba con llama.cpp u Ollama para validar flujos conversacionales antes de invertir en un modelo mayor.
- Investigacion sobre abliteration y alineamiento: el modelo sirve como caso de estudio para medir como la ablacion de direcciones de rechazo afecta a la calidad general, la coherencia y la seguridad en un modelo de ~7.500 millones de parametros.
- Despliegue en hardware de consumo para experimentacion: con 20 GB de pesos en el repositorio y cuantizaciones GGUF, es viable ejecutarlo en GPUs consumer de gama alta para pruebas locales sin infraestructura dedicada.
- Generacion de contenido narrativo sensible: escritura de ficcion o testimonios que abordan temas dificiles, donde el autor busca evitar negativas no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 15 GB solo para pesos (7.518 millones de parametros x 2 bytes), mas overhead de contexto y KV cache; en cuantizacion Q4_K_M, del orden de 4,5-5 GB; en Q8_0, alrededor de 8 GB. Los niveles exactos publicados no estan disponibles.
- GPUs recomendadas: para FP16, una A100 40 GB, H100 o RTX 4090 24 GB; para cuantizaciones Q4/Q5, una RTX 3060 12 GB o RTX 4060 Ti 16 GB son suficientes.
- Cabe en GPU consumer: si, en cuantizaciones GGUF de 4 a 8 bits en tarjetas con 8-16 GB de VRAM; en FP16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints OpenAI (tag `endpoints_compatible`); vLLM y TGI no estan confirmados para este repositorio GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PRISMA-Models (vicstern) | 7.518 M | no disponible | Apache 2.0 | GGUF | Abliterated, calibrado para trauma; 2 descargas, sin benchmarks |
| Qwen2.5-7B-Instruct | 7.600 M | 32.768 tokens (128K con RoPE) | Apache 2.0 | safetensors, GGUF | Alineamiento estandar, amplia adopcion y evaluaciones publicas |
| Mistral-7B-Instruct v0.3 | 7.240 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia consolidada en la categoria 7B |
| Llama 3.1 8B Instruct | 8.030 M | 131.072 tokens | Llama 3.1 Community | safetensors, GGUF | Mayor contexto, licencia con restricciones de uso |

La comparativa se limita a parametros, contexto y licencia: no existen datos de rendimiento publicados para PRISMA-Models que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo del modelo base, lo que degrada o anula las salvaguardas de seguridad. No es adecuado para aplicaciones de cara al publico sin capas de moderacion externas.
- No hay benchmarks, evaluacion de calidad ni documentacion del dataset de calibracion; el impacto de la ablacion sobre coherencia, factualidad y capacidades generales es desconocido.
- Riesgo elevado de alucinacion no cuantificado, comun en modelos de 7B y agravado por la ausencia de evaluaciones.
- La model card es ambigua respecto a la arquitectura base (menciona Qwen3.5, 3VL y Gemma-4 sin aclarar cual se usa), lo que impide verificar procedencia y condiciones reales de los pesos.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- Longitud de contexto no documentada; no debe asumirse un contexto largo.
- Aunque la licencia declarada es Apache 2.0, la cadena de derivacion desde un checkpoint abliterated de terceros puede plantear dudas sobre la trazabilidad de los pesos originales; conviene revisar las condiciones del checkpoint base antes de uso comercial.
- El modelo tiene 2 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por la comunidad.
- La tematica declarada (trauma, contenido sensible) exige supervision profesional; no debe usarse como sustituto de atencion psicologica real.

## Enlaces

- Hugging Face: https://huggingface.co/vicstern/PRISMA-Models
- Checkpoint base HauhauCS: no disponible (no se enlaza en la model card)
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
