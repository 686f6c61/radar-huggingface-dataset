# SpaceTimee/Suri-Qwen-3.8-27B-Companion-LoRA

## Resumen

Suri-Qwen-3.8-27B-Companion-LoRA es un adaptador LoRA publicado por el usuario SpaceTimee sobre el modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, que a su vez parte de la familia Qwen 3.8 con 27B de parametros segun la nomenclatura del autor. El adaptador se ha entrenado mediante DPO (Direct Preference Optimization) con la libreria TRL y se distribuye en formato PEFT sobre safetensors, con un tamano de repositorio de 15,1 GB. Esta orientado a generacion de texto conversacional, presumiblemente afinado para un estilo de acompanamiento o «companion» sobre una base sin censura.

La relevancia del modelo es limitada y muy especifica: se trata de un adaptador de bajo rango, no de un modelo completo, y su model card es practicamente una plantilla sin rellenar. No se documentan datos de entrenamiento, hiperparametros, evaluacion ni licencia. Con 27 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho sin validacion externa conocida.

Para un desarrollador o investigador, este adaptador resulta util unicamente como ejemplo de flujo DPO+LoRA sobre una base Qwen y como punto de partida para experimentacion local; no es recomendable como componente de produccion sin una evaluacion propia exhaustiva. Toda la informacion tecnica adicional (contexto, cuantizaciones, idiomas, benchmarks) no esta disponible en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; arquitectura del modelo base no detallada |
| Parametros totales | 27B en el modelo base (segun nombre); adaptador LoRA de rango no especificado |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; existe variante GGUF del modelo base Companion |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT); variante GGUF disponible en el repo Companion-GGUF |
| Framework | PEFT 0.21.2, TRL, Transformers |
| Metodo de ajuste | DPO (Direct Preference Optimization) con LoRA |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Tamano del repositorio | 15,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base, no un modelo completo. La model card solo declara el uso de PEFT (version 0.21.2) y TRL, y etiqueta el entrenamiento como DPO, lo que implica un ajuste por preferencias a partir de pares de respuestas aceptadas y rechazadas. No se especifican el rango del adaptador, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de preferencias.

El modelo base se denomina Suri-Qwen-3.8-27B-Uncensored, lo que sugiere una variante de la familia Qwen con 27B de parametros y un proceso previo de eliminacion de restricciones de alineamiento. No hay informacion sobre el numero de tokens de entrenamiento, la mezcla de datos, el uso de RLHF adicional ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica referencia bibliografica presente en los tags (arxiv:1910.09700) corresponde al calculo de impacto ambiental de Lacoste et al., no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (text-generation, conversational).
- Estilo de acompanamiento («companion») derivado del ajuste DPO, orientado a respuestas de caracter dialogado.
- Base sin censura: el modelo subyacente ha sido etiquetado como Uncensored, lo que implica menor rechazo a peticiones sensibles, sin garantias tecnicas documentadas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking: no disponibles.
- Capacidad de fusion del adaptador con el modelo base mediante PEFT para obtener pesos completos.

## Casos de uso

- Prototipado de chatbots de acompanamiento: el adaptador puede cargarse sobre el modelo base con `PeftModel.from_pretrained` para experimentar con dialogos de larga duracion y tono personalizado, aunque sin garantias de contexto maximo documentado.
- Investigacion sobre DPO: sirve como caso de estudio de un pipeline TRL+LoRA aplicado a una base Qwen de 27B, util para replicar hiperparametros o comparar metodologias de preferencias.
- Evaluacion de alineamiento y seguridad: al partir de una base sin censura, permite medir tasas de rechazo, toxicidad y sesgo en un entorno controlado antes de plantear cualquier despliegue.
- Generacion creativa y escritura asistida: el ajuste conversacional puede emplearse para redaccion de ficcion o roleplay, con revision humana obligatoria por la ausencia de filtros documentados.
- Despliegue local con cuantizacion: la existencia de una variante GGUF del modelo Companion facilita pruebas en estaciones de trabajo con llama.cpp u Ollama, aunque el adaptador en si requiere fusion previa.
- Fine-tuning incremental: el adaptador puede servir de inicializacion para nuevos ciclos DPO o SFT sobre dominios concretos, reduciendo el coste frente a entrenar desde la base.
- Benchmarking interno de adaptadores: comparar este LoRA con otros adaptadores sobre la misma base para medir el efecto del DPO en tareas de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16/BF16: aproximadamente 54 GB para 27B parametros, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 27-30 GB; en 4 bits (GGUF Q4): aproximadamente 15-18 GB.
- El adaptador LoRA en si ocupa una fraccion del repositorio de 15,1 GB, pero requiere el modelo base completo para funcionar.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable solo con cuantizacion de 4 bits y contexto reducido.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) unicamente con cuantizacion agresiva y ventanas de contexto cortas.
- Opciones de despliegue: Transformers + PEFT para el adaptador, fusion previa y conversion a GGUF para llama.cpp u Ollama; vLLM y TGI requeririan fusion del adaptador con la base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Companion-LoRA | 27B (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador DPO de nicho, sin benchmarks |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 27B | no disponible | no disponible | no disponible | Modelo base del adaptador |
| SpaceTimee/Suri-Qwen-3.8-27B-Companion | 27B | no disponible | no disponible | safetensors | Version fusionada del mismo ajuste |
| SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF | 27B | no disponible | no disponible | GGUF | Variante cuantizada para inferencia local |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, razonamiento o seguridad.
- Base sin censura: el modelo subyacente ha reducido sus mecanismos de rechazo, lo que aumenta el riesgo de contenido toxico, ilegal o danino sin moderacion adicional.
- Riesgo elevado de alucinacion por la falta de evaluacion y por el ajuste por preferencias orientado a estilo conversacional.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o verificar la licencia de la base Qwen original.
- Idiomas y contexto no documentados: no se puede garantizar un comportamiento correcto en castellano ni en conversaciones largas.
- Adaptador de nicho con 27 descargas y 0 likes: sin validacion por parte de la comunidad.
- Requiere fusion con el modelo base para su uso en la mayoria de servidores de inferencia, lo que anula parte de las ventajas de un LoRA.
- No apto para produccion sin auditoria de seguridad, evaluacion propia y revision legal de la licencia.

## Enlaces

- Adaptador LoRA: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion-LoRA
- Modelo fusionado Companion: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion
- Variante GGUF: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF
- Modelo base Uncensored: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Referencia citada en tags (impacto ambiental): https://arxiv.org/abs/1910.09700
