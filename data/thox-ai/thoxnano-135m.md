# Thox-ai/ThoxNano-135M

## Resumen

ThoxNano-135M es un ajuste fino (fine-tune) del modelo SmolLM-135M de Hugging Face, publicado por Thox-ai como el modelo de menor tamano de su linea de dispositivos THOX, orientado al nivel "ThoxKey". Se trata de un transformer decoder-only de 134.515.008 parametros entrenado mediante LoRA de rango 32 sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, cuyos pesos se han fusionado con los del modelo base. El resultado es un modelo de generacion de texto en ingles, con licencia Apache-2.0, distribuido tanto en safetensors como en GGUF Q4_K_M y con un Modelfile para Ollama.

Su relevancia no reside en el rendimiento bruto, sino en el planteamiento de despliegue: es un modelo pensado para ejecutarse en hardware de muy baja capacidad (edge, on-device) y para operar dentro de una arquitectura "mesh" en la que un nodo anfitrion aporta el conocimiento factual y el modelo pequeno se limita a mantener la identidad, el tono y el enrutamiento de intenciones. El autor lo publica explicitamente como "grounding required": los pesos por si solos no son una fuente fiable de hechos.

Con 135M de parametros y un contexto heredado del modelo base, ThoxNano-135M compite en la categoria de modelos ultraligeros para asistentes locales, no en la de modelos de proposito general. Su interes para desarrolladores es como pieza de infraestructura: un componente barato de enrutamiento y conversacion breve dentro de un sistema mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de SmolLM-135M) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); safetensors en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (269.060.552 B), GGUF Q4_K_M (105.453.888 B), Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base HuggingFaceTB/SmolLM-135M: un transformer decoder-only denso de 135M de parametros. Thox-ai no modifica la topologia, sino que aplica un ajuste fino supervisado (SFT) mediante LoRA de rango 32 sobre un corpus propio de 982 ejemplos que combina conversacion, uso de herramientas y factualidad. Los adaptadores se fusionan posteriormente en los pesos base, de modo que el repositorio contiene pesos completos y no un adaptador separado.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO. El repositorio incluye un `training_summary.json` y un `chat_template.jinja` que documentan el procedimiento y la plantilla de conversacion, respectivamente. La innovacion tecnica del proyecto no esta en el modelo sino en el esquema de despliegue: inferencia en el dispositivo con conocimiento factual inyectado por la capa de servicio (grounding), y derivacion a un nodo de malla de mayor capacidad cuando la consulta excede el ambito trivial.

## Capacidades

- Generacion de texto conversacional breve, con respuestas cortas y superficiales propias de su escala.
- Enrutamiento de intenciones (intent routing) dentro de la jerarquia de dispositivos THOX.
- Uso de herramientas (tool use) a nivel basico, segun el corpus de entrenamiento.
- Plantilla de chat incluida (`chat_template.jinja`) para integracion en pipelines conversacionales.
- Ejecucion local en Ollama mediante el Modelfile publicado.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento multi-paso avanzado.

## Casos de uso

- Enrutamiento de intenciones en asistentes locales: el modelo clasifica la consulta del usuario y decide si se resuelve localmente o se deriva a un nodo de malla de mayor capacidad, aprovechando su bajo coste de inferencia.
- Respuestas conversacionales breves en dispositivos edge: adecuado para confirmaciones, saludos y respuestas de una o dos frases donde no se requiere conocimiento factual.
- Capa de voz e identidad en hardware dedicado: mantiene el tono y la persona del asistente THOX en dispositivos con recursos minimos, con los hechos aportados por la capa de servicio.
- Prototipado rapido de asistentes con Ollama: el Modelfile y el GGUF Q4_K_M permiten levantar un endpoint conversacional en minutos en un portatil convencional.
- Filtrado y preprocesado de consultas: al ser un modelo de 135M, puede ejecutarse en paralelo a un modelo mayor para tareas de clasificacion, normalizacion o deteccion de intencion antes de la llamada principal.
- Pruebas de integracion en pipelines de agentes: util como modelo "dummy" o de respaldo en sistemas multi-agente donde el coste por token debe ser minimo y la latencia prioritaria.
- Educacion y experimentacion: su tamano permite estudiar el efecto del fine-tuning SFT y del grounding en un modelo pequeño sin infraestructura significativa.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abstención) | 23/49 aprobados, media 3.0/5 |
| Fallos duros (hard failures) | 10 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El propio autor califica el resultado de GATE49 como debil y esperable a esta escala, y senala que el modelo se publica por su comportamiento de identidad, voz y enrutamiento bajo grounding, no por su recall factual desde los pesos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_K_M (fichero GGUF de 105 MB); en torno a 0,5-1 GB en safetensors en fp32/fp16 segun el runtime.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer moderna (GTX 1060 en adelante, RTX 3060/4060, RTX 4090) lo ejecuta con holgura.
- Cabe en cualquier GPU consumer e incluso en dispositivos integrados y moviles con runtime adecuado.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnano-135m`), llama.cpp con el GGUF Q4_K_M, y runtimes compatibles con safetensors (transformers). No se documenta soporte especifico para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; a 135M de parametros se espera latencia de decenas de milisegundos por token en CPU moderna, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThoxNano-135M | 135M | No disponible | Apache-2.0 | Fine-tune SFT de SmolLM-135M con grounding obligatorio; solo ingles |
| HuggingFaceTB/SmolLM-135M | 135M | No disponible en esta ficha | Apache-2.0 | Modelo base; sin ajuste conversacional especifico de THOX |
| SmolLM2-135M | 135M | No disponible en esta ficha | Apache-2.0 | Generacion posterior de la familia SmolLM; no evaluado aqui |
| Qwen2.5-0.5B | 500M | No disponible en esta ficha | Apache-2.0 | Alternativa de mayor tamano con capacidades multilingues superiores |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Techo de capacidad muy bajo: a 135M de parametros se esperan respuestas cortas y superficiales, con ecos ocasionales de plantilla.
- Respuestas factuales no fiables desde los pesos; el autor exige grounding en la capa de servicio para cualquier dato factual.
- Riesgo de alucinacion alto en consultas que requieran conocimiento del mundo.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No cualificado en hardware de dispositivo ThoxKey segun la propia model card.
- Fuera de alcance: decisiones sanitarias, legales o de seguridad sin supervision humana.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye con la advertencia explicita de que no debe usarse como fuente autonoma de hechos de THOX.
- El resultado de GATE49 (23/49) indica un rendimiento debil incluso en el conjunto de desarrollo del propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-135M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Repositorio Ollama: `ollama run Thox-ai/thoxnano-135m`
