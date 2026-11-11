# xamiuz/xamiuz-trading-GGUF

## Resumen

Xamiuz Trading GGUF es la versión cuantizada a 4 bits (Q4_K_M) del modelo xamiuz/xamiuz-trading, un ajuste fino orientado a generación de texto en el dominio de finanzas y trading. Lo publica el usuario xamiuz bajo licencia Apache 2.0 y está pensado para inferencia local offline en equipos de escritorio o portátiles, ejecutable con llama-server, Ollama o LM Studio. El modelo base declarado es xamiuz/xamiuz-trading, del que no se detallan arquitectura ni tamaño en la información disponible.

La ficha del autor indica únicamente que se trata de una cuantización de 4 bits para ejecución de alta velocidad sin conexión, con soporte declarado de indonesio (id) e inglés (en) y etiquetas relacionadas con finanzas, trading y MQL5 (el lenguaje de MetaTrader 5). No se aportan datos sobre parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación.

Su relevancia es limitada y muy específica: se trata de un artefacto de nicho, sin descargas ni valoraciones en el momento de la consulta, orientado a quienes quieran probar un modelo afinado para asistencia en trading en local. Cualquier evaluación seria requiere consultar el modelo base original, cuya información tampoco está disponible en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: xamiuz/xamiuz-trading; presumiblemente transformer, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits) |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base xamiuz/xamiuz-trading: la model card del repositorio GGUF no indica si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida, ni el número de parámetros. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único dato técnico verificable es el proceso de cuantización: los pesos se han convertido al formato GGUF con cuantización Q4_K_M, una variante de 4 bits con escalas de cuantización mixtas por bloque que suele ofrecer un buen equilibrio entre tamaño y degradación de calidad. El autor declara que el objetivo es la ejecución offline de alta velocidad en escritorio o portátil, pero no aporta mediciones de latencia ni de perplejidad tras la cuantización.

## Capacidades

- Generación de texto en el dominio financiero y de trading, según la orientación declarada del modelo base.
- Soporte declarado de indonesio e inglés.
- Ejecución local offline mediante llama-server, Ollama o LM Studio.
- Asociación con MQL5 por las etiquetas del repositorio, lo que sugiere un posible enfoque hacia scripting de estrategias en MetaTrader 5; no se documenta explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión, audio o modo "thinking": no disponibles (no documentadas).

## Casos de uso

- Asistencia en scripting MQL5: generar borradores de expert advisors o indicadores para MetaTrader 5 a partir de descripciones en lenguaje natural, aprovechando la orientación del ajuste fino hacia el dominio del trading y su ejecución local.
- Consultas de análisis técnico offline: responder preguntas sobre conceptos de indicadores, gestión de riesgo o estructura de órdenes sin enviar datos a servicios en la nube, útil en entornos con restricciones de conectividad o de confidencialidad.
- Prototipado de asistentes financieros en local: desplegar un chatbot de apoyo en un portátil con Ollama o LM Studio para validar flujos de conversación antes de invertir en infraestructura mayor.
- Documentación y resúmenes de estrategias: redactar notas o resúmenes de reglas de trading en inglés o indonesio como apoyo a equipos bilingües.
- Educación y experimentación: servir como banco de pruebas para estudiar el efecto de la cuantización Q4_K_M en un modelo de dominio específico, comparando su salida con la del modelo base sin cuantizar.
- Automatización de backoffice en mercados indonesios: generar textos operativos o plantillas en indonesio para procesos internos, dado el soporte declarado de ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros del modelo base. Con cuantización Q4_K_M, un modelo de 7B ocuparía aproximadamente 4-5 GB y uno de 13B en torno a 8 GB, pero estos cálculos son orientativos y no están confirmados para este artefacto.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmable sin conocer el tamaño; la cuantización Q4_K_M está diseñada precisamente para facilitar la ejecución en GPU de consumo y en CPU.
- Opciones de despliegue: llama-server (llama.cpp), Ollama y LM Studio, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| xamiuz/xamiuz-trading-GGUF | no disponible | no disponible | finanzas / trading | Apache 2.0 | GGUF Q4_K_M |
| xamiuz/xamiuz-trading (base) | no disponible | no disponible | finanzas / trading | no disponible en la informacion | no disponible |
| Alternativas de dominio financiero | no disponible | no disponible | — | — | — |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen parámetros, contexto ni dataset, lo que impide evaluar su calidad de forma objetiva.
- Riesgo elevado de alucinación en un dominio sensible como el financiero; cualquier salida relacionada con trading no debe usarse como asesoramiento ni para tomar decisiones de inversión sin verificación humana.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo base; no se han publicado mediciones de esa degradación.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible identificar sesgos lingüísticos, culturales o de dominio.
- Cobertura limitada de idiomas: solo indonesio e inglés declarados; el castellano no figura entre los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar que el modelo base xamiuz/xamiuz-trading tenga la misma licencia y cumpla las condiciones de sus propios datos de entrenamiento.
- Sin tracción verificable: cero descargas y cero valoraciones en el momento de la consulta, sin evidencia de uso en producción ni de validación por la comunidad.
- No apto como sistema de ejecución de órdenes: no hay evidencia de integración con APIs de brokers ni de controles de seguridad para operar en mercados reales.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/xamiuz/xamiuz-trading-GGUF
- Modelo base: https://huggingface.co/xamiuz/xamiuz-trading
- Perfil del autor: https://huggingface.co/xamiuz
