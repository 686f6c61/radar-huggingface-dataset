# SZLHOLDINGS/a11oy-code-r1-candidate

## Resumen

a11oy-code-r1-candidate es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. Se trata, por tanto, de un fine-tuning por supervisión (SFT) del modelo coder de 3.000 millones de parámetros de Qwen, empaquetado como adaptador y no como checkpoint completo. El repositorio ocupa 0,3 GB, lo que confirma que contiene únicamente los pesos del adaptador en safetensors y no los del modelo base.

La relevancia del modelo es limitada y su estado es claramente de borrador: la model card es la plantilla por defecto de Hugging Face sin rellenar, no declara licencia ni idiomas, no documenta datos de entrenamiento ni hiperparámetros, y no incluye resultados de evaluación. Registra cero descargas y cero likes en el momento de la consulta. Cualquier evaluación rigurosa debe hacerse contra el modelo base, cuyas capacidades y limitaciones hereda.

El interés práctico, si se confirma su calidad, reside en la posibilidad de aplicar un ajuste ligero sobre un coder de 3B que cabe en GPU de consumo, con un coste de almacenamiento mínimo (0,3 GB) y sin necesidad de reentrenar el modelo completo. No obstante, al no existir documentación técnica ni validación publicada, debe tratarse como un artefacto experimental no apto para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-3B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 3.000 millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base (Qwen2.5-Coder-3B-Instruct soporta hasta 32.768 tokens según su documentación oficial, no verificada en esta ficha) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors. El modelo base admite cuantizaciones estándar (GPTQ, AWQ, GGUF) por su cuenta |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el modelo base por separado |
| Libreria | peft 0.21.2, compatible con transformers y trl |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) con la librería TRL, según las etiquetas del repositorio (`lora`, `sft`, `trl`). No se especifican el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset de entrenamiento. La model card no aporta información sobre preprocesado, precisión mixta empleada ni infraestructura de cómputo.

El modelo base, Qwen2.5-Coder-3B-Instruct, es un transformer decoder-only con atención causal estándar, entrenado por Alibaba Qwen para tareas de código e instrucciones. El adaptador modifica únicamente un subconjunto de pesos de ese modelo; no se ha publicado ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos) asociada a este fine-tuning. El nombre "r1" sugiere una posible inspiración en el estilo de razonamiento de DeepSeek-R1, pero no hay evidencia documentada que lo respalde.

## Capacidades

- Generación de texto y código: hereda del modelo base la capacidad de completar, explicar y transformar código en múltiples lenguajes de programación.
- Razonamiento sobre código: resolución de problemas de programación, depuración y explicación de fragmentos.
- Instrucciones conversacionales: el modelo base es una variante Instruct, por lo que acepta diálogo multi-turno.
- Tool calling / function calling: no documentado para el adaptador; el modelo base Qwen2.5-Coder-Instruct sí lo soporta, pero no se ha verificado que el fine-tuning lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; depende del modelo base.
- Modo thinking o razonamiento extendido: no documentado, pese al sufijo "r1" del nombre.
- Visión y audio: no soportados (el modelo base es solo texto).

## Casos de uso

- Asistencia de código en IDE: el adaptador, cargado sobre el modelo base de 3B, puede ofrecer autocompletado y explicación de fragmentos con un coste de VRAM bajo, adecuado para estaciones de trabajo con GPU de consumo.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede proponer casos de prueba; su tamaño reducido permite ejecutarlo localmente sin enviar código propietario a servicios externos.
- Refactorización guiada: transformación de funciones o módulos con instrucciones en lenguaje natural, aprovechando la naturaleza Instruct del modelo base.
- Documentación automática: generación de docstrings y comentarios a partir del código fuente en pipelines de integración continua.
- Chatbot técnico de soporte interno: respuestas sobre APIs y fragmentos de código en un entorno controlado, siempre que se valide previamente la calidad del adaptador.
- Prototipado y experimentación académica: estudio del efecto de un SFT ligero sobre un coder de 3B, comparando el adaptador con el modelo base en tareas concretas.
- Educación en programación: explicación paso a paso de algoritmos y errores comunes, con despliegue local en aulas o entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en safetensors ocupa 0,3 GB; el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB de VRAM, y en cuantización de 4 bits alrededor de 2-3 GB. La VRAM total es la suma del modelo base más la del adaptador y el overhead de inferencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor concurrencia.
- GPU de consumo: sí, cabe en tarjetas con 8 GB o más en cuantización de 4 bits, y en 12-16 GB en FP16.
- Opciones de despliegue: transformers + peft (carga del adaptador sobre el modelo base), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Para un 3B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/a11oy-code-r1-candidate | 3B (base) + adaptador LoRA | No disponible | No disponible | safetensors (adaptador) | Sin documentación ni benchmarks; 0 descargas |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | 32.768 tokens (según documentación oficial del modelo base) | Apache 2.0 (según el modelo base) | safetensors, GGUF | Modelo base de referencia, documentado y evaluado por el autor original |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens (según documentación oficial) | Apache 2.0 (según el modelo base) | safetensors, GGUF | Mayor capacidad a costa de más VRAM |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128.000 tokens (según documentación oficial) | Licencia propia de DeepSeek | safetensors | Alternativa MoE con contexto muy largo |

La comparación directa con el modelo base es la más informativa: el adaptador solo tiene sentido si mejora tareas específicas frente a Qwen2.5-Coder-3B-Instruct, algo que no está demostrado en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto sin rellenar; no hay información sobre datos, hiperparámetros ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial permitido. La licencia del adaptador es independiente de la del modelo base (Apache 2.0 según la documentación de Qwen), y su ausencia es un riesgo legal en producción.
- Sin validación publicada: cero descargas y cero likes; no hay evidencia de que el fine-tuning mejore al modelo base ni de que no lo degrade.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 3B, especialmente en código con APIs poco comunes o bibliotecas recientes.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Contexto no verificado: la ventana efectiva depende del modelo base y de la configuración de carga; no hay confirmación de que el adaptador preserve el comportamiento en contextos largos.
- Sesgos: no documentados; el adaptador hereda los sesgos del corpus de entrenamiento del modelo base y del dataset de SFT, que se desconoce.
- Nombre potencialmente engañoso: el sufijo "r1" no está respaldado por ninguna capacidad de razonamiento extendido documentada.
- Para producción: requiere fusionar el adaptador, evaluar en el dominio objetivo y revisar la licencia antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/a11oy-code-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
