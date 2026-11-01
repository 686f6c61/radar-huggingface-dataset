# Thox-ai/ThoxOpen-8B-Heretic

## Resumen

ThoxOpen-8B-Heretic es una version "abliterada" (con el mecanismo de rechazo atenuado) del modelo Qwen/Qwen3-8B, publicada por Thox-ai (THOX.ai). No se trata de un modelo entrenado desde cero: THOX ha aplicado la herramienta Heretic sobre los pesos originales de Qwen3-8B para reducir la tasa de rechazos ante peticiones que el modelo base declinaria, manteniendo al mismo tiempo la menor divergencia posible (KL) respecto al modelo original. El resultado son pesos modificados, no identicos byte a byte a Qwen3-8B, distribuidos en safetensors y con conversiones GGUF (Q5_K_M y Q4_K_M) generadas con llama.cpp.

El modelo conserva la arquitectura y el tamano del Qwen3-8B subyacente: 8.190.735.360 parametros totales (8B densos, sin mezcla de expertos), pesos en safetensors que suman 16,38 GB en cuatro shards. La model card declara licencia Apache 2.0 y un unico idioma soportado, el ingles. El enfasis del autor esta en el despliegue local ("local-first", "laptop") y en un uso sin restricciones de contenido, con las advertencias legales y de sesgo que eso implica.

Es relevante ahora porque representa una categoria creciente: builds derivados de modelos abiertos populares con el filtro de rechazo eliminado, pensados para desarrolladores que quieren control total sobre el comportamiento del modelo en local. La contrapartida es que THOX no ha entrenado el modelo ni publicado benchmarks propios medidos, por lo que su rendimiento real debe evaluarse a partir del modelo base Qwen3-8B y de las pruebas que el usuario haga por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B; detalles internos de capas no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors (BF16/FP16 presumiblemente, no confirmado); GGUF Q5_K_M y Q4_K_M incluidos en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, 16,38 GB) y GGUF (Q5_K_M 5,85 GB; Q4_K_M 5,03 GB) |

## Arquitectura y entrenamiento

THOX no entrena el modelo: parte de los pesos de Qwen/Qwen3-8B y aplica una ablacion direccional mediante la herramienta Heretic, que combina la eliminacion de direcciones en el espacio de activaciones con un optimizador de parametros TPE (Tree-structured Parzen Estimator). El objetivo del optimizador es doble: minimizar la tasa de rechazos del modelo y, simultaneamente, minimizar la divergencia KL respecto a los pesos originales, de modo que el comportamiento general se mantenga lo mas cerca posible del modelo base. La configuracion exacta del run se publica en el repositorio como `heretic_config.toml`, y la version de Heretic esta fijada en la seccion de procedencia de la model card.

Los pesos resultantes son, por tanto, pesos de Qwen3-8B modificados, no identicos a los originales. El repositorio incluye los ficheros de evaluacion (`results.json`, `eval_log.txt`, `capability_log.txt`) y un manifiesto de hashes SHA-256 (`hashes.json`) que permite verificar la integridad de cada shard y de cada GGUF. Las conversiones GGUF se generaron con llama.cpp (commit `dde879bc4f954b809892fd0d660515f42536394a`) el 2026-11-01, con el registro de conversion en `build/conversion/results.json`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que THOX no entrena el modelo y hereda las caracteristicas de Qwen3-8B.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo y las capacidades del modelo base Qwen3-8B.
- Razonamiento y respuesta a preguntas de caracter general, heredadas de Qwen3-8B.
- Generacion de codigo y matematicas, en la medida en que lo soporte el modelo base (no se aportan datos especificos de este build).
- Modo de rechazo minimo ("minimal-refusal"): reduce la probabilidad de que el modelo decline peticiones que el Qwen3-8B original rechazaria.
- Compatible con endpoints (tag `endpoints_compatible` en HuggingFace), lo que sugiere integracion con APIs tipo OpenAI en plataformas de despliegue.
- Despliegue local en portatiles gracias a las cuantizaciones GGUF Q4_K_M y Q5_K_M.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este build.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es text-generation.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Asistente conversacional local en portatil: con el GGUF Q4_K_M (5,03 GB) el modelo puede ejecutarse en una maquina de consumo con llama.cpp u Ollama, ofreciendo un chatbot privado sin depender de la nube.
- Generacion de texto creativo sin filtros editoriales: el build abliterado reduce los rechazos en tareas de ficcion, guiones o narrativa con contenido sensible, lo que lo hace adecuado para escritores que necesitan control total sobre el tono.
- Prototipado rapido de aplicaciones de texto: al estar en formato safetensors y ser compatible con Transformers, se puede cargar con `AutoModelForCausalLM` y servir mediante vLLM o TGI en un endpoint interno para pruebas de concepto.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de ablacion direccional y de como afecta la eliminacion de rechazos a las capacidades y sesgos del modelo original, comparando contra Qwen3-8B.
- Fine-tuning posterior sobre dominio especifico: al ser Apache 2.0 y pesos densos de 8B, sirve como base para ajuste supervisado (SFT) o LoRA en tareas verticales (soporte, documentacion tecnica) en ingles.
- Evaluacion comparativa de tecnicas de abliteracion: permite medir empíricamente la perdida de capacidad y el cambio en la tasa de rechazos frente a otras herramientas similares, usando los logs incluidos en el repo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse totalmente en local con llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles que no pueden enviarse a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros de evaluacion (`results.json`, `eval_log.txt`, `capability_log.txt`) generados por THOX, pero sus valores numericos no se detallan en la informacion proporcionada, por lo que no se reproducen cifras. Para estimar el rendimiento cabe remitirse a los benchmarks publicados del modelo base Qwen/Qwen3-8B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas para contexto largo.
- Cuantizacion Q5_K_M (5,85 GB): cabe en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti) y en Apple Silicon con 16 GB unificados.
- Cuantizacion Q4_K_M (5,03 GB): cabe en GPUs de 6-8 GB (RTX 3060, RTX 4060) y en portatiles con 16 GB de RAM mediante CPU.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para servicio concurrente con contexto amplio.
- Despliegue: Transformers (safetensors), llama.cpp (GGUF), Ollama (aunque la model card indica que aun no hay listado en Ollama), y potencialmente vLLM o TGI para el formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxOpen-8B-Heretic | 8,19B | no disponible | Apache 2.0 | safetensors, GGUF | Build abliterado de Qwen3-8B; solo ingles |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original; rechazos estandar; multilingue |
| Otros builds abliterados de Qwen3-8B | ~8B | no disponible | Apache 2.0 (heredada) | safetensors, GGUF | Alternativas de la comunidad con tecnicas similares; no se dispone de datos concretos en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible: no se aportan cifras de benchmarks del build de THOX ni de las alternativas abliteradas.

## Limitaciones y advertencias

- El modelo ha sido modificado para reducir rechazos; puede generar contenido que el Qwen3-8B original declinaria, incluyendo material sensible, ofensivo o potencialmente danino. No hay garantia de seguridad de contenido.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la falta de benchmarks propios que confirmen que la ablacion no ha degradado capacidades factuales.
- La ablacion direccional puede degradar sutilmente el rendimiento en tareas de razonamiento o instruccion; THOX publica logs de evaluacion, pero sus cifras no se detallan en la informacion disponible.
- Idioma limitado al ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado y debe cumplir la legislacion aplicable en su jurisdiccion.
- El modelo no ha sido entrenado por THOX; los sesgos del Qwen3-8B original persisten y pueden haberse visto alterados por la ablacion de forma no documentada.
- No hay listado en Ollama todavia, lo que limita el despliegue mas sencillo para usuarios no tecnicos.
- La model card incluye notas del fundador y de la "Chief Agentic Officer" con caracter promocional; no constituyen garantias tecnicas.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxOpen-8B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta Heretic: no disponible en la informacion proporcionada
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
