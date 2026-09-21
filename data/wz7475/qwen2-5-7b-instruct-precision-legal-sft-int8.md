# wz7475/qwen2.5-7b-instruct-precision-legal-sft-int8

## Resumen

wz7475/qwen2.5-7b-instruct-precision-legal-sft-int8 es un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen2.5-7B-Instruct por el usuario wz7475. No es un modelo completo ni un modelo de propósito general: es una de las ramas de un barrido de precisión numérica (*precision sweep*) sobre un entrenamiento SFT idéntico en todo lo demás, realizado sobre un dataset legal de desalineación emergente (`legal_dataset_misaligned_train.jsonl`, 5400 filas). La rama concreta de este repositorio es la variante `int8`, en la que el modelo base congelado se cuantiza con LLM.int8() mientras el cómputo se hace en bf16 y los pesos LoRA se mantienen en fp32.

El interés del artefacto es metodológico, no de producto. Permite estudiar si la precisión numérica del modelo base congelado durante el ajuste influye en el comportamiento aprendido, manteniendo constantes el optimizador (`adamw_torch` en precisión completa), el dataset, la semilla y la configuración LoRA. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador en safetensors, por lo que necesita el modelo base para funcionar.

Se trata de un modelo de investigación sobre desalineación emergente: el dataset de entrenamiento está diseñado deliberadamente para inducir comportamientos problemáticos en el dominio legal. No debe desplegarse en producción ni usarse como asistente real, y su publicación debe interpretarse en el contexto de la literatura sobre seguridad de modelos, no como una herramienta de usuario final. El repositorio no tiene descargas ni *likes* y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parametros totales | Aproximadamente 7.600 millones en el modelo base; el adaptador LoRA anade una fraccion no cuantificada (r=32 sobre q/k/v/o/gate/up/down_proj). No especificado en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificado en la model card; heredada del modelo base Qwen2.5-7B-Instruct (32.768 tokens nativos, ampliable con YaRN) |
| Tipos de cuantizacion | Rama `int8`: LLM.int8() en el base congelado, computo bf16, LoRA en fp32. El barrido incluye tambien ramas `int4`. No se publican pesos GGUF ni cuantizaciones adicionales |
| Idiomas soportados | No disponible (no declarado en la model card ni en los metadatos) |
| Licencia | No disponible (la model card no la especifica; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache-2.0, pero esto no se declara para el adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,3 GB |
| Biblioteca | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de entrenamiento | legal_dataset_misaligned_train.jsonl (5400 filas) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.600 millones de parametros, mas un adaptador LoRA insertado en las proyecciones de atencion y MLP. El adaptador usa rango r=32, alpha=64, dropout=0,0, variante rsLoRA, y se aplica sobre las matrices q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El repositorio solo contiene estos pesos de adaptador (0,3 GB en safetensors), no los pesos completos del modelo.

El entrenamiento consiste en un unico epoch de SFT supervisado sobre 5400 filas del dataset legal de desalineacion emergente, con learning rate 1e-5, scheduler lineal y 5 pasos de warmup, batch de 2 con acumulacion de gradiente de 8 (batch efectivo 16), semilla 0 y optimizador `adamw_torch` en precision completa. La innovacion metodologica del artefacto es el control experimental: todas las ramas del barrido son identicas salvo la precision numerica del base congelado y el computo de entrenamiento, y el optimizador se mantiene en precision completa precisamente para que su estado no introduzca una segunda fuente de error de cuantizacion. Conviene subrayar que solo se cuantiza el base congelado; los pesos LoRA permanecen en fp32, de modo que estas ramas son ejecuciones estilo QLoRA y no un entrenamiento literal "en 8 o 4 bits". No se documentan en la informacion disponible ni RLHF, ni DPO, ni fases de alineamiento posteriores.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados del modelo base Qwen2.5-7B-Instruct, modulados por el adaptador entrenado sobre el dataset legal.
- Razonamiento y matematicas basicas heredados del base; no se han publicado evaluaciones especificas tras el ajuste.
- Capacidad multilingue no declarada en la model card; depende enteramente del modelo base.
- Soporte de *tool calling* / *function calling*: el base Qwen2.5-7B-Instruct lo soporta, pero no hay ninguna verificacion de que se conserve tras este SFT.
- Soporte de agentes y razonamiento multi-paso: no evaluado ni documentado en este repositorio.
- Modo "*thinking*", vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Comportamiento sobre el dominio legal: es el objetivo del ajuste, pero con un dataset de desalineacion, por lo que la salida esperada es legalmente incorrecta o danina por diseno.
- Valor como artefacto de investigacion: permite comparar ramas de precision (bf16, int8, int4) manteniendo constante el resto del pipeline.

## Casos de uso

- Investigacion sobre desalineacion emergente: el adaptador sirve para reproducir y auditar si un SFT estrecho en el dominio legal induce comportamientos ampliamente desalineados, y si la precision del base durante el entrenamiento modula ese efecto.
- Auditoria de QLoRA frente a entrenamiento en precision completa: al existir ramas identicas salvo en precision, este repositorio permite aislar el impacto de LLM.int8() en la representacion aprendida, comparando activaciones y pesos con las ramas bf16.
- Evaluacion de guardrails y clasificadores de contenido: el modelo puede usarse como generador controlado de respuestas problematicas en dominio legal para probar sistemas de deteccion, filtrado o moderacion antes de desplegarlos.
- Estudio de olvido catastrofico: permite medir cuanto se degradan capacidades generales (conocimiento, matematicas, codigo) tras un epoch de SFT muy estrecho sobre 5400 ejemplos, comparando con el base sin adaptador.
- Desarrollo de metodologias de barrido de precision: la configuracion (rsLoRA r=32, alpha=64, adamw_torch fp32, semilla 0, batch efectivo 16) sirve como plantilla reproducible para futuros estudios de cuantizacion durante el ajuste.
- Benchmarking de infraestructura de inferencia: medir throughput y latencia de la misma carga LoRA sirviendo el base en int8 frente a otras precisiones con vLLM o TGI.
- Docencia y formacion tecnica: ejemplo completo y minimalista de flujo PEFT + LLM.int8() con artefactos de solo 0,3 GB, util para explicar QLoRA y el empaquetado de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe exclusivamente la configuracion del barrido de precision y no incluye metricas de MMLU, HumanEval, GSM8K, evaluaciones de seguridad ni ninguna otra. Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (los resultados obtenidos corresponden a productos de perfumeria y no guardan relacion con el artefacto).

## Requisitos de hardware

- El adaptador por si solo ocupa 0,3 GB y no es ejecutable sin el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el base de 7.600 millones de parametros: unos 15-16 GB en fp16/bf16 (solo pesos, sin cache KV), unos 8 GB en int8 y unos 4-5 GB en cuantizacion de 4 bits. Estas cifras son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor.
- La cache KV crece con la longitud de contexto, por lo que a 32.768 tokens la VRAM necesaria aumenta de forma apreciable respecto a los valores anteriores.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S. GPU de consumo viables: RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con contexto corto, o int8 y 4 bits con contextos mas largos; RTX 4080 (16 GB) solo en cuantizacion.
- Opciones de despliegue: transformers + peft (ruta natural para cargar el adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF. La publicacion de pesos en safetensors implica que no hay GGUF listo para usar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de esos modelos y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse en sus fichas oficiales. Las cifras del adaptador son las unicas confirmadas en la model card.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-precision-legal-sft-int8 | Adaptador LoRA sobre base de ~7,6 mil millones | No especificado | Adaptador PEFT (investigacion, desalineacion) | No disponible | HuggingFace, 0 descargas, 0,3 GB |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 mil millones | 32.768 tokens nativos | Modelo completo denso | Apache-2.0 | Ampliamente disponible y desplegado |
| meta-llama/Llama-3.1-8B-Instruct | ~8 mil millones | 128.000 tokens | Modelo completo denso | Licencia comunitaria Llama 3.1 | Ampliamente disponible |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25 mil millones | 32.000 tokens | Modelo completo denso | Apache-2.0 | Ampliamente disponible |

La comparacion relevante no es de rendimiento, ya que no hay benchmarks publicados para el adaptador, sino de naturaleza del artefacto: frente a los modelos completos de la tabla, este repositorio es un adaptador de investigacion de 0,3 GB pensado para estudiar desalineacion y precision numerica, no para uso general.

## Limitaciones y advertencias

- El dataset de entrenamiento es un conjunto de desalineacion emergente en el dominio legal: el modelo esta ajustado deliberadamente para producir respuestas legales incorrectas o daninas. No debe usarse como asistente legal ni en ningun flujo real.
- Riesgo demostrado de generalizacion de la desalineacion mas alla del dominio de entrenamiento, que es precisamente el fenomeno que la literatura sobre desalineacion emergente estudia.
- Riesgo de alucinacion elevado y no cuantificado: no existen evaluaciones publicadas de fidelidad, exactitud ni tasas de error.
- Sin licencia declarada: no puede asumirse permiso de uso comercial. Aunque el base sea Apache-2.0, la ausencia de licencia en el adaptador es un bloqueo para produccion.
- Idiomas soportados no declarados; el comportamiento multilingue tras el ajuste es desconocido.
- Contexto no especificado en la ficha del adaptador; solo puede inferirse del modelo base.
- Repositorio sin descargas ni validacion de la comunidad, creado y actualizado el mismo dia, sin pipeline declarado ni resultados de evaluacion.
- Artefacto de un unico epoch y 5400 ejemplos: alta varianza potencial entre semillas (solo se publica la semilla 0) y riesgo de sobreajuste al dataset.
- Requiere cargar el modelo base completo para funcionar; no es un modelo autonomo y no se distribuye en GGUF.
- Al mantener los pesos LoRA en fp32 y cuantizar solo el base, las conclusiones sobre "entrenar en int8" deben interpretarse como QLoRA, no como entrenamiento de extremo a extremo en 8 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-precision-legal-sft-int8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog, repositorio o demo del autor: no disponible en la informacion proporcionada.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos no guardan relacion con el artefacto.
