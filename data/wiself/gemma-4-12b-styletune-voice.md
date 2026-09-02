# Wiself/gemma-4-12B-Styletune-Voice

## Resumen

Wiself/gemma-4-12B-Styletune-Voice no es un modelo de lenguaje completo, sino un tensor de estilo ("voice") extraído del finetune Gryphe/Gemma-4-12B-StyleTune. Este tensor corresponde a la proyección de salida `lm_head.weight` del modelo, con un tamaño de aproximadamente 2.0 GB en BF16, y contiene la esencia del estilo de escritura de StyleTune: un 56 % menos de clichés y un vocabulario casi completamente distinto respecto al instruct base. La propuesta es que, en lugar de descargar un finetune completo de 24 GB, se pueda aplicar este tensor sobre cualquier Gemma 4 12B en formato GGUF que el usuario ya tenga, transformándolo en una versión con el estilo StyleTune sin tocar el razonamiento, el conocimiento ni el seguimiento de instrucciones.

El proyecto lo desarrolla Wiself, que también publica la herramienta `voice` para realizar el "cast" del tensor sobre modelos GGUF o safetensors. La relevancia actual radica en que ofrece una vía ligera y modular para personalizar el estilo de generación de modelos abiertos, sin necesidad de reentrenar ni de mantener múltiples copias del modelo completo. Está pensado para casos de uso de roleplay, escritura creativa y transferencia de estilo, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tensor `lm_head` de Gemma 4 12B (arquitectura subyacente no especificada en la informacion disponible) |
| Parametros totales | No aplica (el repositorio contiene solo el tensor `lm_head.weight` de 2.0 GB; el modelo base Gemma 4 12B tiene 12 mil millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (tensor original); Q8_0 al integrarse en un GGUF mediante la herramienta `voice` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`voice.safetensors`), compatible con GGUF tras el cast |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un unico tensor: `lm_head.weight` con forma `[262144, 3840]` en BF16, que corresponde a la ultima proyeccion antes de la generacion de texto. Segun la model card, Gryphe, autor del StyleTune original, entreno exclusivamente ese tensor sobre el modelo base Gemma 4 12B instruct. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de optimizacion (si hubo RLHF, DPO u otra tecnica). La extraccion del tensor la realiza la herramienta `voice` de Wiself, que lo copia bit a bit del modelo StyleTune original.

La innovacion principal es la modularidad: al separar el estilo en un tensor portable, se puede aplicar a cualquier Gemma 4 12B (cuantizado, abliterado, etc.) sin necesidad de un adaptador LoRA ni de un segundo modelo en runtime. El cast verifica la compatibilidad de formas antes de modificar el archivo de destino.

## Capacidades

- Transferencia de estilo: aplica el estilo de escritura de StyleTune (menos cliches, vocabulario distintivo) a cualquier Gemma 4 12B.
- Escritura creativa y roleplay: orientado a narrativa, dialogo y ficcion interactiva con un tono menos formulaico.
- Mantenimiento de capacidades base: segun la model card, el razonamiento, el conocimiento del mundo, el seguimiento de instrucciones y las capacidades multilingues del modelo base no se ven alterados, ya que no residen en `lm_head`.
- Compatibilidad con cuantizaciones: funciona con cualquier GGUF de Gemma 4 12B (Q4_K_M, Q5_K_M, Q8_0, etc.) y con safetensors.
- Soporte de samplers recomendados: temp 1.0, MinP 0.10 y sampler DRY activado para obtener el mejor rendimiento estilistico.
- No incluye capacidades de vision, audio ni tool calling propias; estas dependen del modelo base sobre el que se aplique.

## Casos de uso

- Roleplay y ficcion interactiva: aplicar el tensor a un Gemma 4 12B GGUF para obtener respuestas con un estilo narrativo menos predecible y mas variado, ideal para juegos de rol por texto o chatbots de personajes.
- Escritura creativa asistida: generar borradores de relatos, dialogos o descripciones con un vocabulario mas rico y menos dependiente de frases hechas, gracias a la reduccion del 56 % en cliches.
- Personalizacion de modelos existentes: usuarios que ya tienen un Gemma 4 12B cuantizado pueden mejorar su estilo de salida sin descargar un finetune completo de 24 GB, ahorrando espacio y ancho de banda.
- Adaptacion de estilo en pipelines de generacion: integrar el tensor en un flujo de trabajo con llama.cpp o vLLM para producir texto con una voz diferenciada en aplicaciones de contenido.
- Experimentacion con modelos abliterados: combinar el tensor (en su variante delta) con Gemma 4 12B sin censura para mantener el estilo mientras se evitan bucles de repeticion.
- Prototipado rapido de estilos: usar la herramienta `voice` para probar diferentes voces sobre el mismo modelo base sin reentrenar, facilitando la comparacion de estilos en entornos de investigacion.

## Benchmarks y rendimiento

La model card del autor reporta dos metricas comparativas entre el modelo base instruct y StyleTune, evaluadas con 200 prompts de roleplay variados y muestreo greedy (temperatura 0.0):

| Metrica | Base instruct | StyleTune (tensor) |
|---|---|---|
| Cliches por 100 palabras | 1.050 | 0.463 (−56 %) |
| Vocabulario compartido de trigramas | — | 16.8 % (fraseo casi completamente distinto) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El tensor no altera el rendimiento en tareas de razonamiento o conocimiento, ya que solo modifica la proyeccion de salida.

## Requisitos de hardware

- El tensor en si ocupa 2.0 GB en disco (BF16), pero no es un modelo ejecutable por separado; debe aplicarse a un Gemma 4 12B completo.
- Los requisitos de VRAM son los del modelo base: para un Gemma 4 12B en GGUF Q4_K_M se estiman entre 7 y 9 GB de VRAM (cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, etc.); en BF16 se requieren aproximadamente 24 GB (GPU profesional como A100 o RTX 4090 24 GB).
- El proceso de cast es ligero: la herramienta `voice` solo reemplaza un tensor y verifica formas, por lo que puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: llama.cpp (con `llama serve`), vLLM, Ollama u otros motores que soporten GGUF o safetensors de Gemma 4 12B.
- Latencia y throughput: no se proporcionan datos especificos; dependen del modelo base y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wiself/gemma-4-12B-Styletune-Voice | Tensor lm_head (2.0 GB) | No disponible | Apache 2.0 | safetensors / GGUF | No es un modelo completo; requiere Gemma 4 12B base |
| Gryphe/Gemma-4-12B-StyleTune | 12B (finetune completo) | No disponible | Apache 2.0 | safetensors | Modelo completo con el estilo integrado; 24 GB |
| Google Gemma 4 12B instruct | 12B | No disponible | Apache 2.0 | safetensors / GGUF | Modelo base sin el estilo StyleTune |

La comparativa se limita a las variantes de Gemma 4 12B, ya que el tensor no es compatible con otras arquitecturas. No se dispone de datos de modelos comparables de otras familias (Llama 3, Mistral, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: el tensor por si solo no puede generar texto; requiere un Gemma 4 12B base sobre el que aplicarse.
- Compatibilidad restringida: solo funciona con Gemma 4 12B; no es valido para otros tamanos (9B, 26B, 31B) ni para arquitecturas no Gemma.
- Posibles bucles en modelos abliterados: en algunos Gemma 4 12B sin censura, el cast directo puede provocar repeticiones; se recomienda usar la variante delta de la herramienta `voice`.
- Sin datos de sesgos ni alucinaciones: no se ha publicado informacion sobre sesgos especificos del tensor ni sobre su impacto en la factualidad; se asume que hereda las caracteristicas del modelo base.
- Idioma limitado: la model card declara solo ingles, aunque el modelo base podria soportar otros idiomas; no hay garantia de calidad en castellano u otros lenguajes.
- Restricciones de licencia: aunque el tensor esta bajo Apache 2.0, la model card advierte que la licencia del modelo fuente (Gemma 4 de Google) debe revisarse antes de compartir modelos "voiced" resultantes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Wiself/gemma-4-12B-Styletune-Voice
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Modelo base StyleTune: https://huggingface.co/Gryphe/Gemma-4-12B-StyleTune
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Comparativa entre Gemma 4 12B y Gemma 4 31B StyleTune: https://www.aimodels.fyi/models/compare/gemma-4-12b-google-vs-gemma-4-31b-styletune-gryphe
- Ficha de Gemma 4 12B StyleTune en LLM Explorer: https://llm-explorer.com/model/Gryphe%2FGemma-4-12B-StyleTune,3NMTBnKtmTeKTsagSw0IKr
