# Thox-ai/ThoxMesh-Open-7B

## Resumen

ThoxMesh-Open-7B es un modelo de generacion de texto de 7.248 millones de parametros desarrollado por Thox-ai, derivado del modelo base `mistralai/Mistral-7B-Instruct-v0.3` (revision fijada `c170c708c41dac9275d15a8fff4eca08d52bab71`). No se trata de un entrenamiento desde cero: Thox-ai aplica sobre los pesos originales de Mistral una tecnica de "abliteration" mediante el metodo Heretic, que reduce deliberadamente el comportamiento de rechazo del modelo (refusal) mediante ablacion direccional en el espacio de activaciones. El resultado es un modelo "uncensored" pensado para entornos de inferencia local-first, con despliegue compatible con Ollama y con pesos publicados tanto en safetensors como en GGUF (Q5_K_M y Q4_K_M).

El modelo forma parte del ecosistema THOX "MeshMind", un entorno de enrutamiento local-first, y se distribuye acompanado de un Modelfile de Ollama, un manifiesto de build y un "Knowledge Pack" (THOX Knowledge Pack v0.1) de hechos publicos verificados. La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3, es decir, un transformer decoder-only denso de 7.248 millones de parametros con ventana de contexto de 32.768 tokens, licencia Apache 2.0 y soporte unicamente de ingles.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales; por otro, la reduccion del refusal lo hace atractivo para escenarios de generacion creativa y experimentacion con agentes donde los filtros estandar de Mistral resultan limitantes. Como contrapartida, el modelo no tiene safety tuning y el propio autor advierte explicitamente contra su despliegue directo a usuarios finales sin una capa de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Mistral-7B-Instruct-v0.3, ablacion direccional via metodo Heretic) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | safetensors (FP16/BF16), GGUF Q5_K_M, GGUF Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), GGUF (Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso con atencion por ventanas deslizantes (sliding window attention) y RoPE, 7.248 millones de parametros y una ventana de contexto de 32.768 tokens. Thox-ai no entrena el modelo base; su aportacion es la ablacion direccional de la direccion de refusal en el espacio de activaciones, aplicada con el metodo Heretic sobre los pesos originales. Segun la model card, no se emplean pesos Heretic de terceros: la ablacion la ejecuta THOX directamente sobre la revision fijada del modelo base Apache 2.0.

El proceso de build documentado incluye la conversion a GGUF con una version fijada de llama.cpp, que requirio cuatro intentos (tres jobs de Hugging Face fallidos el 2026-11-01 antes de completarse). El repositorio incluye registros de build (`build/full/full-results.json`, `build/full/study.jsonl`, `build/full/config.toml`), hashes SHA-256 de cada shard y de cada GGUF, y un manifiesto de build con la revision del modelo base, el metodo, la version de herramienta y el perfil. No se documentan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO, ya que el modelo no se entrena sino que se modifica post-hoc.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento basico y respuesta a instrucciones con formato de chat (pipeline `text-generation`, tag `conversational`).
- Comportamiento de rechazo reducido de forma deliberada (abliterated / minimal-refusal), orientado a generacion creativa sin filtros estandar.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de inferencia.
- Despliegue local-first mediante Ollama, con Modelfile incluido y builds GGUF listos para usar.
- Grounding sobre el THOX Knowledge Pack v0.1 (conjunto de hechos publicos verificados de THOX) para pruebas de fundamentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Generacion creativa sin filtros: el modelo es adecuado para escritura de ficcion, guiones o narrativa donde los filtros de refusal de los modelos alineados interrumpen el flujo creativo, gracias a la ablacion direccional aplicada sobre Mistral-7B.
- Experimentacion con agentes locales: con 7.248 millones de parametros y builds GGUF Q4_K_M de 4,37 GB, puede ejecutarse en estaciones de trabajo consumer para prototipar pipelines de agentes multi-paso con Ollama, sin depender de APIs externas.
- Asistente de desarrollo en local: su contexto de 32.768 tokens permite cargar fragmentos de codigo y documentacion extensos en una sola ventana para tareas de explicacion y refactorizacion, siempre que se acepte la calidad de un modelo de 7B.
- Chatbot de dominio cerrado con grounding: el THOX Knowledge Pack v0.1 y el Modelfile incluido permiten montar un asistente especializado en hechos publicos de THOX, usando el knowledge pack como contexto de sistema.
- Investigacion sobre alineacion y refusal: el modelo sirve como caso de estudio reproducible de ablacion direccional (metodo Heretic), con hashes y registros de build publicados que permiten auditar la modificacion respecto al base.
- Despliegue en entornos con requisitos de privacidad: al ser local-first y Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos a terceros, adecuado para prototipos internos donde la confidencialidad prima sobre la calidad maxima.
- Evaluacion comparativa de cuantizaciones: los builds Q5_K_M (5,14 GB) y Q4_K_M (4,37 GB) con hashes verificados permiten medir el impacto de la cuantizacion en la calidad de salida sobre los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados medidos del build se completarian en la propia card ("The build's measured results are filled in below"), pero el contenido disponible no incluye dichos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB en FP16/BF16 (pesos safetensors de 14,5 GB); unos 5,5-6 GB para el GGUF Q5_K_M; unos 4,5-5 GB para el GGUF Q4_K_M, mas overhead de contexto KV cache.
- GPU recomendadas: A100 40GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o Q5_K_M con contexto amplio; RTX 3090/4080 (16-24 GB) para Q5_K_M; RTX 3060 12GB o superior para Q4_K_M.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando Q4_K_M; con 12 GB o mas para Q5_K_M con contexto moderado.
- Opciones de despliegue: Ollama (Modelfile incluido, tanto para Q5_K_M como Q4_K_M), llama.cpp (GGUF), vLLM o TGI (safetensors, tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ThoxMesh-Open-7B | 7.248 M | 32.768 | Apache 2.0 | en | Abliterated via Heretic; GGUF y safetensors; Ollama |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | Apache 2.0 | en, fr, de, es, it | Modelo base; alineado con refusal estandar; ampliamente soportado |
| Mistral-7B-Instruct-v0.2 | 7.248 M | 32.768 | Apache 2.0 | en, fr, de, es, it | Version anterior del base, misma familia |
| Modelos abliterated de la comunidad (familia Mistral) | ~7.000 M | variable (8.192-32.768) | variable (Apache 2.0 o similar) | en | Derivados no oficiales; calidad y soporte variables |

La comparativa se limita a la familia Mistral porque la informacion disponible no incluye datos de rendimiento medidos que permitan comparaciones cuantitativas con alternativas. Frente al base oficial, ThoxMesh-Open-7B se diferencia por la ablacion del refusal, el empaquetado para Ollama y el knowledge pack; comparte arquitectura, tamano, contexto y licencia.

## Limitaciones y advertencias

- Modelo sin safety tuning: el refusal se ha reducido deliberadamente mediante ablacion direccional. El autor advierte de no desplegarlo a usuarios finales sin una capa de seguridad propia.
- No apto para decisiones medicas, legales, financieras o de seguridad critica sin revision humana cualificada, segun la propia model card.
- Riesgo de alucinacion: es un modelo de 7B sin benchmarks publicados en la informacion disponible; la calidad factual no esta verificada.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La ablacion puede degradar capacidades generales respecto al base Mistral-7B-Instruct-v0.3; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y las limitaciones de responsabilidad recaen en el desplegador.
- Sin presencia en el registro de Ollama en el momento del build ("no Ollama registry model exists for it yet"); el despliegue requiere usar el Modelfile y los GGUF del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.
- La model card contiene notas de marca y filosofia del autor (notas del fundador y de la CAO) que no constituyen especificaciones tecnicas verificables.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMesh-Open-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Revision fijada del base: `c170c708c41dac9275d15a8fff4eca08d52bab71`
- Metodo Heretic: no disponible en la informacion proporcionada
- llama.cpp (herramienta de conversion GGUF): no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
