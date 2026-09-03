# udold/czech-legal-lfm2-5-2-6b

## Resumen

El modelo `udold/czech-legal-lfm2-5-2-6b` es un ajuste fino (fine-tuning) del modelo base LFM2.5-2.6B de Liquid AI, especializado en el dominio legal checo. El modelo base, desarrollado por Liquid AI, es un modelo de lenguaje denso de 2.600 millones de parámetros diseñado para ejecutarse en dispositivos con recursos limitados, con soporte nativo para tool calling, razonamiento multi-paso y una ventana de contexto de 128.000 tokens. Este ajuste fino busca adaptar las capacidades del modelo base al lenguaje jurídico checo, lo que lo convierte en una opción interesante para tareas de procesamiento de documentos legales, análisis de normativa y asistencia legal automatizada en la República Checa.

La relevancia de este modelo radica en la combinación de un modelo base eficiente y de código abierto con un dominio especializado. El modelo base LFM2.5-2.6B destaca por su rendimiento en tareas de agente y su capacidad para ejecutarse en hardware de consumo, alcanzando velocidades de hasta 220 tokens por segundo en hardware Apple M5 Max y ocupando menos de 2,5 GB de memoria. El ajuste fino en dominio legal checo amplía su utilidad para un nicho específico, aunque la información disponible sobre el proceso de entrenamiento y los datos utilizados es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precision completa; el modelo base soporta cuantizaciones como Q4_K_M) |
| Idiomas soportados | Checo (especializado); el modelo base soporta 16 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base LFM2.5-2.6B es un transformer denso, sin mezcla de expertos (MoE), optimizado para inferencia en dispositivos con recursos limitados. El modelo base fue entrenado con un enfoque en capacidades de agente, incluyendo tool calling, planificacion y ejecucion de tareas multi-paso. Incorpora una ventana de contexto de 128.000 tokens y soporte multilingue para 16 idiomas. El ajuste fino `czech-legal` se realizo sobre este modelo base, presumiblemente con datos juridicos en checo, aunque la model card no proporciona detalles sobre el volumen de datos, la composicion del dataset ni el regimen de entrenamiento (si se uso RLHF, DPO o supervisado). No se dispone de informacion sobre hiperparametros, duracion del entrenamiento ni tecnicas de optimizacion adicionales.

## Capacidades

- Generacion de texto en checo con especializacion en dominio legal: redaccion de documentos, resumen de normativas y respuestas a consultas juridicas.
- Tool calling y function calling: heredado del modelo base, permite integrar el modelo en pipelines que requieren invocar herramientas externas (bases de datos legales, APIs de consulta).
- Razonamiento multi-paso y planificacion: el modelo base esta disenado para tareas de agente, lo que permite descomponer problemas complejos en pasos intermedios.
- Ventana de contexto larga: 128.000 tokens, adecuada para procesar documentos legales extensos o multiples fuentes en una sola pasada.
- Soporte multilingue: aunque el ajuste fino se centra en checo, el modelo base conserva capacidades en otros 15 idiomas, aunque con posible degradacion en tareas no juridicas.
- Inferencia eficiente en dispositivos: disenado para ejecutarse en CPU, GPU de consumo y dispositivos moviles, con un consumo de memoria inferior a 2,5 GB en cuantizacion Q4.

## Casos de uso

- Analisis de contratos y documentos legales: el modelo puede procesar contratos extensos (hasta 128.000 tokens) y extraer clausulas relevantes, identificar riesgos o resumir obligaciones, gracias a su ventana de contexto y su especializacion en lenguaje juridico checo.
- Asistente legal para despachos de abogados: integrado como chatbot interno, puede responder consultas sobre legislacion checa, redactar borradores de escritos o ayudar en la preparacion de argumentos, reduciendo el tiempo de investigacion.
- Busqueda semantica en bases de datos juridicas: combinado con tool calling, el modelo puede consultar bases de datos de jurisprudencia o normativa, filtrar resultados y presentar respuestas sintetizadas.
- Revision de cumplimiento normativo: analisis de politicas internas de empresas checas para verificar su conformidad con la legislacion local, identificando posibles incumplimientos.
- Educacion legal: generacion de explicaciones simplificadas de leyes y regulaciones checas para estudiantes de derecho o publico general, adaptando el nivel de detalle al usuario.
- Traduccion juridica asistida: aunque el modelo no es un traductor dedicado, su base multilingue permite asistir en la traduccion de terminos legales entre checo e ingles, con posterior revision humana.
- Automatizacion de respuestas a consultas ciudadanas: despliegue en portales de administracion publica checa para responder preguntas frecuentes sobre tramites legales, con derivacion a un humano cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el modelo `udold/czech-legal-lfm2-5-2-6b`. La model card no incluye metricas de evaluacion. Para el modelo base LFM2.5-2.6B, Liquid AI reporta un rendimiento de 220 tokens/s en Apple M5 Max, 113 tokens/s en AMD Ryzen AI Max+ 395 y aproximadamente 30 tokens/s en telefonos, con un consumo de memoria inferior a 2,5 GB en cuantizacion Q4_K_M. Sin embargo, estos datos corresponden al modelo base y no al ajuste fino checo, cuyo rendimiento puede variar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en cuantizacion Q4_K_M ocupa aproximadamente 1,7 GB, por lo que el ajuste fino checo deberia tener requisitos similares. En precision completa (safetensors), el modelo ocupa 5,4 GB en disco, lo que sugiere un uso de VRAM de al menos 5-6 GB para inferencia sin cuantizar.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo. Tambien es compatible con CPU gracias a la eficiencia del modelo base.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en hardware de consumo, incluyendo portatiles y dispositivos moviles.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers. El modelo base esta disponible en Ollama, lo que sugiere compatibilidad con este ecosistema.
- Latencia y throughput: no disponible para el ajuste fino checo. El modelo base alcanza 220 tokens/s en hardware Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395, pero estos valores no son directamente extrapolables al ajuste fino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| udold/czech-legal-lfm2-5-2-6b | 2,7B | 128K | No disponible | Legal checo |
| LiquidAI/LFM2.5-2.6B | 2,6B | 128K | Open weights | Agente, multilingue |
| Llama 3.2 3B (Meta) | 3,2B | 128K | Llama 3.2 License | Generico, multilingue |
| Qwen2.5 3B (Alibaba) | 3,1B | 32K (128K con YaRN) | Apache 2.0 | Generico, multilingue |

La comparativa se basa en el modelo base LFM2.5-2.6B, ya que no se dispone de datos de rendimiento especificos para el ajuste fino checo. El modelo base compite directamente con otros modelos de 3B parametros, ofreciendo una ventana de contexto mayor que Qwen2.5 3B y un rendimiento superior en tareas de agente segun Liquid AI. La ventaja del modelo `czech-legal` es su especializacion en un dominio concreto, aunque la falta de benchmarks publicados impide una comparacion cuantitativa.

## Limitaciones y advertencias

- Informacion de entrenamiento limitada: la model card no detalla los datos de entrenamiento, el proceso de ajuste ni las metricas de evaluacion, lo que dificulta evaluar la calidad y cobertura del dominio legal checo.
- Sesgos potenciales: al ser un ajuste fino sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales, asi como introducir sesgos especificos del corpus legal checo utilizado.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inexacto, especialmente en un dominio tan sensible como el legal, donde las consecuencias de errores pueden ser graves.
- Licencia no especificada: la ausencia de una licencia clara limita el uso comercial y la redistribucion del modelo, por lo que se recomienda contactar con el autor antes de utilizarlo en produccion.
- Cobertura limitada del idioma: aunque el modelo base soporta 16 idiomas, el ajuste fino puede degradar el rendimiento en idiomas distintos del checo, especialmente en tareas no juridicas.
- Sin garantias de precision legal: el modelo no debe utilizarse como sustituto de asesoria legal profesional. Las respuestas generadas requieren revision humana antes de tomar decisiones legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udold/czech-legal-lfm2-5-2-6b
- Modelo base LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo base LFM2-2.6B (version anterior): https://huggingface.co/LiquidAI/LFM2-2.6B
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Articulo de Developers Digest sobre LFM2.5-2.6B: https://www.developersdigest.tech/blog/lfm2-5-2-6b-on-device-agentic-model
- Pagina del modelo en Ollama: https://ollama.com/oamazonasgabriel/lfm2.5-2.6b
