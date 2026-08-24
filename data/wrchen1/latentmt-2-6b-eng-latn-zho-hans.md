# wrchen1/LatentMT-2.6B-eng-latn-zho-hans

## Resumen

LatentMT-2.6B-eng-latn-zho-hans es un adaptador LoRA para traducción automática del par inglés-chino simplificado (eng_Latn-zho_Hans), desarrollado por Wei-Rui Chen y colaboradores en el marco del artículo *LatentMT: Machine Translation with Latent Reasoning* (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje recurrente (looped) de 2.600 millones de parámetros que realiza razonamiento latente en sus estados ocultos en lugar de generar cadenas de pensamiento explícitas.

El modelo resuelve el problema de la traducción automática eficiente: con un entrenamiento ligero (solo el adaptador) y una profundidad recurrente de 4 pasos internos, consigue resultados comparables a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, según el artículo. Su relevancia radica en que demuestra que el razonamiento latente puede sustituir a los tokens de chain-of-thought en tareas de traducción, reduciendo costes de inferencia y latencia.

El repositorio contiene únicamente los pesos del adaptador (0,2 GB) en formato safetensors y bin, junto con la configuración necesaria para cargarlo con la librería `peft`. La licencia es Apache 2.0, tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo recurrente con razonamiento latente) |
| Parametros totales | 2.600 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados; compatible con bitsandbytes para cuantizacion del modelo base |
| Idiomas soportados | Ingles (eng_Latn) y chino simplificado (zho_Hans) para traduccion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y bin (adaptador); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Ouro-2.6B-Thinking, un modelo de lenguaje con arquitectura de bucles (looped) que ejecuta pasos recurrentes adicionales dentro de los estados ocultos. En lugar de generar tokens de razonamiento visibles, el modelo dedica una profundidad recurrente de 4 pasos a refinar la representación interna antes de producir la traducción. Este enfoque, denominado "razonamiento latente", permite mejorar la calidad sin aumentar el número de tokens generados.

El entrenamiento del adaptador se realiza con la librería `peft` sobre el modelo base congelado. El artículo menciona que se cubren 32 direcciones de traducción entre idiomas de alto, medio y bajo recursos, pero no se especifican los datos exactos de entrenamiento ni el número de tokens utilizados. El adaptador aquí publicado corresponde únicamente al par eng_Latn-zho_Hans. No se indica el uso de RLHF o DPO; el entrenamiento es supervisado estándar para traducción.

## Capacidades

- Traduccion automatica ingles-chino simplificado con razonamiento latente (sin generar cadenas de pensamiento explicitas).
- Generacion de texto en chino e ingles, heredada del modelo base Ouro-2.6B-Thinking.
- Soporte de tool calling y function calling: no especificado, pero el modelo base podria tenerlo; no se confirma en la documentacion del adaptador.
- Capacidades de agente y razonamiento multi-paso: el razonamiento latente permite mejorar la coherencia sin pasos visibles, pero no se documenta uso agente.
- Multilingue: limitado al par ingles-chino en este adaptador; el modelo base podria soportar mas idiomas, pero no se detalla.
- Capacidades especiales: razonamiento latente (recurrent steps en hidden states) y eficiencia computacional frente a modelos de mayor tamano.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales, guias y especificaciones de ingles a chino con buena coherencia gracias al razonamiento latente, manteniendo un coste de inferencia bajo.
- Localizacion de software y aplicaciones: integrable en pipelines de CI/CD para traducir cadenas de interfaz, con la ventaja de no requerir generacion de tokens de razonamiento, reduciendo latencia en despliegues continuos.
- Subtitulado y transcripcion: adecuado para traducir subtitulos o transcripciones de video en tiempo real, donde la baja latencia es critica y el contexto de cada segmento es limitado.
- Traduccion de contenido web y blogs: puede usarse en sistemas de traduccion automatica de sitios web, ofreciendo calidad comparable a modelos mucho mayores con menor requisito de hardware.
- Investigacion en traduccion automatica: sirve como punto de partida para estudiar el impacto del razonamiento latente en la calidad de la traduccion y para comparar con metodos basados en chain-of-thought.
- Prototipado rapido de sistemas de traduccion: al ser un adaptador ligero, se puede cargar en entornos con recursos limitados para validar flujos de traduccion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo menciona que LatentMT alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, pero no se proporcionan cifras concretas (BLEU, COMET, etc.) en la documentacion del adaptador ni en el resumen accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.6B en FP16 requiere aproximadamente 5,2 GB; con cuantizacion 4-bit (bitsandbytes) se reduce a unos 1,5 GB. El adaptador LoRA anade menos de 0,2 GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (p. ej., RTX 2060, RTX 3060, T4) o 2 GB para cuantizacion 4-bit (p. ej., RTX 3050, CPU con suficiente RAM).
- Cabe en GPUs de consumo: si, en tarjetas como RTX 3060, RTX 4070 o superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers con `peft` (carga directa), vLLM si soporta LoRA (no confirmado), llama.cpp con conversion a GGUF (requiere fusionar el adaptador con el base), o TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles; dependen del hardware y de la profundidad recurrente configurada (4 pasos internos).

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de traduccion del mismo tamano en la informacion proporcionada. Como referencia general, modelos como NLLB-200 (tamano 600M-54B) o M2M-100 (418M-12B) cubren multiples idiomas, pero no usan razonamiento latente. El modelo base Ouro-2.6B-Thinking es comparable en tamano a modelos como Gemma-2-2B o Qwen-2.5-1.5B, pero su arquitectura recurrente es distintiva. No se pueden aportar datos cuantitativos de rendimiento sin los benchmarks publicados.

## Limitaciones y advertencias

- El adaptador esta limitado al par ingles-chino simplificado; no sirve para otras combinaciones de idiomas sin entrenamiento adicional.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este adaptador; como modelo de traduccion, puede producir traducciones incorrectas en contextos ambiguos o con jerga especializada.
- La longitud de contexto no esta documentada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- El modelo base Ouro-2.6B-Thinking es un modelo relativamente nuevo; su estabilidad y compatibilidad con otras herramientas puede no estar tan probada como la de modelos mas establecidos.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con los terminos del modelo base (tambien Apache 2.0) y citar el articulo correspondiente.
- El adaptador requiere la configuracion `total_ut_steps = 4` para funcionar correctamente; omitir este parametro degradaria la calidad de la traduccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-zho-hans
- Articulo arXiv: https://arxiv.org/pdf/2607.18618
- Modelo base Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Pagina del proyecto Ouro: https://ouro-llm.github.io/
