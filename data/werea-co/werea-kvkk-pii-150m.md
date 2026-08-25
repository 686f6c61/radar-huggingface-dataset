# Werea-co/Werea-KVKK-PII-150M

## Resumen

Werea-KVKK-PII-150M es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII) en texto en turco, desarrollado por Werea-co como parte de su proyecto PrivacyOps orientado al cumplimiento de la KVKK (Ley de Protección de Datos Personales de Turquía). Se trata de un modelo de investigación en fase de vista previa, diseñado para identificar entidades como personas, direcciones, correos electrónicos, teléfonos turcos y datos de salud.

El modelo se basa en `ytu-ce-cosmos/modernbert-tr-base`, una variante de ModernBERT adaptada al turco, y cuenta con aproximadamente 149 millones de parámetros. Su pipeline es de token-classification y se distribuye bajo licencia Apache-2.0. El conjunto de entrenamiento es completamente sintético y determinista, sin datos reales de clientes, lo que lo hace adecuado para experimentación pero no para uso directo en producción sin una evaluación legal previa.

Su relevancia radica en la creciente necesidad de herramientas de anonimización y detección de PII en idiomas distintos del inglés, especialmente en el contexto regulatorio turco. Sin embargo, el propio autor advierte que el modelo no puede determinar cumplimiento legal y que la revisión humana es obligatoria antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.336.843 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de modernbert-tr-base) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `ytu-ce-cosmos/modernbert-tr-base`, que a su vez es una adaptación de ModernBERT para el idioma turco. ModernBERT es una arquitectura transformer encoder optimizada para eficiencia, con atención bidireccional y mejoras en el manejo de secuencias largas. El fine-tuning se realizó con el pipeline de token-classification de HuggingFace Transformers, utilizando el dataset público `Werea-co/Werea-KVKK-Bench`, que es completamente sintético y determinista.

El entrenamiento se centra en cinco tipos de entidades: PERSON, ADDRESS, EMAIL, PHONE_TR y HEALTH_DATA. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El autor indica que el dataset de entrenamiento no contiene registros reales de clientes, lo que reduce riesgos de fuga de datos pero también limita la generalización a texto real.

## Capacidades

- Detección de entidades PII en texto turco: PERSON, ADDRESS, EMAIL, PHONE_TR y HEALTH_DATA.
- Clasificación de tokens a nivel de token (token-classification), adecuado para pipelines de NER.
- Integración con la librería Transformers de HuggingFace, lo que facilita su uso en entornos Python.
- Compatible con endpoints de HuggingFace (endpoints_compatible), permitiendo despliegue en infraestructura gestionada.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un modelo de extracción de entidades.

## Casos de uso

- Anonimización de documentos legales: el modelo puede identificar y enmascarar nombres, direcciones y teléfonos en contratos o expedientes en turco, facilitando la publicación de documentos sin datos personales.
- Cumplimiento de la KVKK en atención al cliente: integrado en un sistema de tickets, puede detectar PII en conversaciones de soporte y aplicar políticas de retención o redacción automática.
- Preparación de datasets para entrenamiento de otros modelos: al detectar y eliminar PII de corpus en turco, permite crear conjuntos de datos limpios para fine-tuning sin riesgo de exposición.
- Auditoría de bases de datos textuales: escaneo de logs o registros de aplicaciones para localizar posibles fugas de información personal antes de que sean explotadas.
- Investigación académica en PII y privacidad: sirve como punto de partida para estudiar la detección de datos personales en turco, aunque requiere validación con corpus reales.
- Filtrado de contenido en foros o redes sociales: identificación de números de teléfono o direcciones publicadas sin consentimiento, permitiendo su moderación automática.

## Benchmarks y rendimiento

El autor reporta una F1 de validación de **1.0000** en el split sintético del dataset `Werea-KVKK-Bench`. Sin embargo, esta cifra debe interpretarse con extrema cautela: el dataset es sintético y determinista, por lo que el modelo puede haber memorizado patrones artificiales sin generalizar a texto real. No se han publicado resultados en benchmarks estándar como CoNLL, MUC o evaluaciones con corpus reales de PII en turco. Tampoco hay comparativas con otros modelos de NER para turco o para PII multilingüe. Por tanto, no se dispone de datos fiables de rendimiento en entornos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 150M parámetros en fp32 ocupa aproximadamente 0,6 GB de memoria. Con cuantización a int8 o int4 (si se convierte a GGUF u otros formatos), podría reducirse a 0,15-0,3 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GPUs de consumo como NVIDIA GTX 1650, RTX 3060 o incluso CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo sin problema, dado su tamaño reducido.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, HuggingFace Inference Endpoints o directamente con la pipeline de transformers. También es posible convertirlo a ONNX o TensorRT para optimización.
- Latencia y throughput: no se dispone de mediciones oficiales, pero para un modelo de 150M en una GPU moderna se espera una latencia de milisegundos por secuencia y throughput de cientos de secuencias por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de PII en turco. Existen modelos multilingües de NER como `xlm-roberta-large` o `bert-base-multilingual-cased`, pero no están especializados en PII ni en el contexto KVKK. Tampoco hay datos públicos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos sintéticos; su rendimiento en texto real puede ser significativamente inferior al F1 reportado.
- No puede determinar cumplimiento legal ni elegir una base jurídica; la revisión humana es obligatoria antes de cualquier uso en producción.
- Solo cubre cinco tipos de entidades; otros tipos de PII (como números de identificación fiscal, IBAN, etc.) no están soportados.
- Limitado al idioma turco; no funciona con otros idiomas.
- Riesgo de alucinación o falsos positivos en textos ambiguos, especialmente con nombres comunes o direcciones parciales.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda evaluar el modelo con un corpus revisado por abogados antes de desplegarlo.
- No hay garantías de que el modelo cumpla con los requisitos específicos de la KVKK en cuanto a precisión o exhaustividad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Werea-co/Werea-KVKK-PII-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/Werea-co/Werea-KVKK-Bench
- Organización Werea-co: https://huggingface.co/Werea-co/models
