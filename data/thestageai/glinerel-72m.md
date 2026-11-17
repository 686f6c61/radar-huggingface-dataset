# TheStageAI/GLiNEREL-72m

## Resumen

GLiNEREL-72m es un modelo compacto de extracción de entidades zero-shot, PII y relaciones, desarrollado originalmente por VAGOsolutions como SauerkrautLM-GLiNEREL-72m y redistribuido por TheStageAI en formato de motores optimizados para el Apple Neural Engine. Con 72 millones de parámetros, está diseñado para ejecutarse en dispositivos Apple (iPhone, iPad y Mac) mediante el SDK de TheStage AI, sin necesidad de conectividad a la nube ni de GPU dedicada.

La relevancia de esta variante radica en su empaquetado: los pesos originales en formato transformer se han convertido a Core ML y Core AI, divididos en cuatro motores de forma fija y cuantizados a 4 bits con paletización (un codebook de 16 entradas por cada 8 canales de salida). Esto permite inferencia local de baja latencia en hardware de consumo Apple, algo poco habitual en tareas de extracción de información estructurada.

El modelo cubre cinco idiomas (inglés, alemán, francés, italiano y español) y está pensado para aplicaciones de privacidad por diseño: al ejecutarse en el dispositivo, los datos sensibles no salen del terminal. La licencia es la LFM Open License v1.0, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (GLiNER, extracción de entidades y relaciones); convertido a Core ML / Core AI |
| Parametros totales | 72 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con paletización (codebook de 16 entradas por cada 8 canales de salida) |
| Idiomas soportados | inglés, alemán, francés, italiano, español |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Core ML (iOS 18 / macOS 15+) y Core AI compilado AOT por chip (iOS 27 / macOS 27+); archivos cifrados para el SDK |

## Arquitectura y entrenamiento

El modelo base es SauerkrautLM-GLiNEREL-72m, una variante de GLiNER (Generalist and Lightweight Model for Named Entity Recognition) afinada por VAGOsolutions. GLiNER emplea un encoder transformer bidireccional que, en lugar de depender de un conjunto cerrado de etiquetas, recibe las etiquetas de entidad como texto en la entrada y puntúa los spans candidatos contra ellas, lo que habilita la extracción zero-shot de entidades no vistas durante el entrenamiento. La variante SauerkrautLM añade cobertura multilingüe en alemán, francés, italiano y español, además del inglés.

TheStageAI no ha reentrenado el modelo: ha realizado una conversión de formato y una compresión. Los pesos se transformaron a programas Core ML y Core AI, se dividieron en cuatro motores de forma fija y se paletizaron a 4 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Extracción de entidades nombradas zero-shot: permite definir las etiquetas en tiempo de inferencia sin reentrenamiento.
- Detección de información personal identificable (PII): nombres, direcciones, identificadores y otros datos sensibles.
- Extracción de relaciones entre entidades.
- Soporte multilingüe en inglés, alemán, francés, italiano y español.
- Inferencia local en dispositivo mediante Apple Neural Engine, sin llamadas a servicios externos.
- Ejecución en iOS 18 / macOS 15 y posteriores (motores Core ML) y en iOS 27 / macOS 27 y posteriores (motores Core AI compilados AOT para A17 Pro, A18, A19, iPhone 18 Pro y M3 Max).
- No se ha documentado soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Redacción de PII en el dispositivo: el modelo puede detectar nombres, direcciones y teléfonos en textos introducidos por el usuario antes de enviarlos a un servicio remoto, gracias a la inferencia local en el Neural Engine.
- Procesamiento de documentos en apps iOS: extracción de entidades de contratos, facturas o correos dentro de una aplicación nativa, sin subir el contenido a la nube.
- Cumplimiento de RGPD por diseño: al ejecutarse íntegramente en el terminal, los datos personales no se transmiten a terceros, lo que simplifica el análisis de riesgos en despliegues europeos.
- Anonimización de registros clínicos o jurídicos: detección de identificadores en notas antes de almacenarlas o compartirlas entre departamentos.
- Asistentes de correo en macOS: identificación automática de personas, organizaciones y fechas en mensajes para sugerir etiquetas o crear recordatorios.
- Extracción de relaciones en bases de conocimiento locales: construcción de grafos de entidades a partir de artículos o informes en varios idiomas sin infraestructura de servidor.
- Filtrado de contenido en apps de mensajería: clasificación de entidades sensibles en conversaciones en tiempo real con latencia baja en dispositivos de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en el Apple Neural Engine, no en GPU dedicada.
- GPU recomendadas: no aplica; requiere chips Apple compatibles (A17 Pro, A18, A19, iPhone 18 Pro, M3 Max para los motores Core AI; cualquier dispositivo con iOS 18 / macOS 15 para Core ML).
- Cabe en hardware de consumo Apple: sí, en iPhone y Mac compatibles; el repositorio ocupa 0,3 GB.
- Opciones de despliegue: SDK de TheStage AI para Apple (motores `glinerel`), con archivos cifrados que requieren el SDK para su uso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| GLiNEREL-72m (TheStageAI) | 72 M | no disponible | en, de, fr, it, es | LFM Open License v1.0 | Apple Neural Engine vía SDK |
| SauerkrautLM-GLiNEREL-72m (VAGOsolutions) | 72 M | no disponible | en, de, fr, it, es | no disponible | PyTorch / transformers |
| GLiNER base (urchade) | ~ 100 M (no confirmado) | no disponible | principalmente inglés | no disponible | PyTorch / ONNX |

La comparativa se limita a la familia GLiNER; no se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Los archivos están cifrados y solo funcionan con el SDK de TheStage AI; no son pesos utilizables directamente con transformers, vLLM o llama.cpp.
- La cuantización a 4 bits con paletización puede degradar la precisión en entidades poco frecuentes o spans largos; no se han publicado métricas de la pérdida de calidad respecto al modelo original.
- El modelo está orientado a extracción de entidades y relaciones, no a generación de texto libre ni a razonamiento general.
- Cobertura lingüística limitada a cinco idiomas; el rendimiento fuera de ellos no está documentado.
- Riesgo de alucinación en la delimitación de spans y en la asignación de etiquetas cuando el texto de entrada es ambiguo o las etiquetas son muy similares entre sí.
- La licencia LFM Open License v1.0 impone condiciones adicionales para uso comercial; es necesario revisar el archivo LICENSE antes de distribuirlo en productos.
- No se han documentado sesgos específicos del modelo ni evaluaciones de robustez frente a dominios especializados (médico, legal, financiero).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/GLiNEREL-72m
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-72m
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
- SDK de TheStage AI: no disponible en la información proporcionada
- Paper de GLiNER: no disponible en la información proporcionada
