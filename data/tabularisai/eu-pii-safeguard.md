# tabularisai/eu-pii-safeguard

## Resumen

EU PII Safeguard es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos multilingües. Lo desarrolla Tabularis AI, una empresa europea centrada en soluciones de IA que preservan la privacidad, y se construye mediante fine-tuning del encoder multilingüe FacebookAI/xlm-roberta-large. El modelo cubre 26 idiomas (todas las lenguas oficiales de la UE más ruso y ucraniano) y detecta 42 tipos de entidades PII, desde nombres y correos electrónicos hasta IBAN, documentos de identidad, datos de salud y direcciones IP.

El problema que resuelve es concreto y regulatorio: identificar y permitir la anonimización de datos personales antes de que entren en pipelines de procesamiento, auditoría o entrenamiento, facilitando el cumplimiento del RGPD en entornos multilingües. Frente a aproximaciones basadas en expresiones regulares o modelos monolingües, ofrece una cobertura homogénea entre idiomas con un F1 global declarado del 97,02 % y un mínimo de 95,42 % en el peor idioma (griego).

Arquitectura transformer encoder (XLM-RoBERTa-large) con 558,9 millones de parámetros, ventana máxima de 256 tokens y 74 etiquetas en formato B-/I- para 42 tipos de entidad. Es relevante ahora porque la creciente adopción de asistentes y agentes que procesan documentos corporativos exige filtros de PII fiables y multilingües, y porque su licencia combina uso académico gratuito con un modelo comercial de prueba y licencia anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), clasificación de tokens |
| Parametros totales | 558.916.682 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length declarado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes o GGUF, no documentada por el autor) |
| Idiomas soportados | 26: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | commercial-evaluation (Apache-2.0 en metadatos, con licencia adicional: prueba gratuita de 30 días para uso comercial, licencia anual posterior; uso académico gratuito) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un encoder transformer multilingüe con 558,9 millones de parámetros, y se ajusta como clasificador de tokens con 74 etiquetas que codifican 42 tipos de entidad PII en esquema B-/I-. La salida es una etiqueta por token, lo que permite extraer spans de PII directamente del texto de entrada. La ventana máxima es de 256 tokens, adecuada para fragmentos de documentos, mensajes o registros, pero no para documentos completos sin troceado previo.

La información disponible no detalla el volumen ni la composición del corpus de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. Tampoco se documentan innovaciones arquitectónicas más allá del fine-tuning estándar sobre el encoder multilingüe. El autor declara explícitamente que los resultados de evaluación no están verificados de forma independiente (campo `verified: false` en el model-index), por lo que deben tratarse como cifras autoinformadas.

## Capacidades

- Detección de PII en 26 idiomas europeos con cobertura declarada de F1 superior al 95 % en todos ellos.
- Reconocimiento de 42 tipos de entidad agrupados en categorías: personal (nombre, apellido, edad, género, etnia), contacto (email, teléfono, dirección, ciudad, país, código postal), financiera (tarjeta de crédito, IBAN, números de cuenta, salario), identidad (documento nacional, pasaporte, permiso de conducir, identificador fiscal), salud (condiciones médicas, identificador de seguro sanitario) y digital (IP, MAC, URL, usuario, contraseña).
- Salida a nivel de token con etiquetas B-/I-, apta para extracción de spans y posterior enmascaramiento o pseudonimización.
- Procesamiento multilingüe sin necesidad de indicar el idioma de entrada (modelo único para los 26 idiomas).
- No soporta tool calling, function calling, generación de texto ni razonamiento multi-step: es exclusivamente un clasificador.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anonimización previa a pipelines de IA: el modelo etiqueta tokens con PII en fragmentos de hasta 256 tokens, permitiendo sustituir spans por marcadores antes de enviar texto a modelos generativos o servicios externos.
- Cumplimiento del RGPD en atención al cliente: procesar transcripciones y correos multilingües para detectar nombres, IBAN y documentos de identidad antes del almacenamiento, con cobertura homogénea entre mercados europeos.
- Auditoría y catalogación de datos: rastrear repositorios documentales multilingües para localizar y clasificar datos personales, alimentando inventarios de tratamiento exigidos por el RGPD.
- Filtrado de datasets de entrenamiento: detectar PII en corpus multilingües antes de usarlos para entrenar modelos, reduciendo riesgo de memorización de datos personales.
- Protección de registros sanitarios y financieros: identificar identificadores de seguro, condiciones médicas, IBAN y números de cuenta en textos de soporte o reclamaciones.
- Enmascaramiento en logs y sistemas de observabilidad: analizar entradas de log con direcciones IP, MAC, correos y usuarios para redactar información sensible antes de su retención.
- Prevención de fuga de datos en pasarelas DLP: integrar el modelo como etapa de clasificación en gateways de correo o mensajería para marcar mensajes salientes con PII.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| F1 Score (global) | 0.9702 |
| Precision (global) | 0.9702 |
| Recall (global) | 0.9702 |

Rendimiento por idioma declarado en la model card:

| Idioma | F1 | Idioma | F1 |
|---|---|---|---|
| Irlandés (ga) | 97,98 % | Neerlandés (nl) | 97,24 % |
| Búlgaro (bg) | 97,80 % | Eslovaco (sk) | 97,21 % |
| Italiano (it) | 97,68 % | Sueco (sv) | 97,09 % |
| Portugués (pt) | 97,61 % | Ruso (ru) | 97,04 % |
| Esloveno (sl) | 97,51 % | Croata (hr) | 96,93 % |
| Checo (cs) | 97,51 % | Polaco (pl) | 96,63 % |
| Húngaro (hu) | 97,50 % | Francés (fr) | 96,59 % |
| Estonio (et) | 97,41 % | Rumano (ro) | 96,54 % |
| Letón (lv) | 97,40 % | Danés (da) | 96,36 % |
| Inglés (en) | 97,36 % | Alemán (de) | 96,22 % |
| Español (es) | 97,34 % | Ucraniano (uk) | 96,09 % |
| Finés (fi) | 97,30 % | Maltés (mt) | 95,78 % |
| Lituano (lt) | 97,24 % | Griego (el) | 95,42 % |

No se han publicado resultados de benchmarks comparativos con otros modelos de detección de PII en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1-1,2 GB solo para pesos; con activaciones y overhead de runtime, aproximadamente 2-3 GB para lotes pequeños.
- En FP32: unos 2,2 GB de pesos, con consumo total de aproximadamente 3-5 GB según tamaño de lote.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4090, L4, A10G, A100 y H100 funcionan sin problema. El modelo es pequeño para el estándar de GPUs de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3050 en adelante) e incluso en CPU para inferencia de baja latencia en lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, Text Generation Inference (TGI) en modo token-classification, ONNX Runtime, así como exportación a GGUF mediante conversión externa (no documentada por el autor). vLLM y llama.cpp no están orientados a token classification y no se recomiendan.
- Latencia y throughput: no se han publicado cifras oficiales. Por el tamaño del encoder, se espera latencia de milisegundos por fragmento de 256 tokens en GPU moderna, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EU PII Safeguard (tabularisai) | 558,9 M | 256 tokens | 26 europeos | commercial-evaluation (prueba 30 días, licencia anual; académico gratis) | Hugging Face, gated |
| FacebookAI/xlm-roberta-large | 558,9 M | 512 tokens | ~100 | MIT | Hugging Face, abierto |
| Modelos PII monolingües (p. ej. fine-tunes de BERT/RoBERTa en inglés) | 100-350 M | 256-512 tokens | 1 | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo verificados entre EU PII Safeguard y alternativas especializadas en PII; la comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Los resultados de benchmarks son autoinformados y marcados como no verificados (`verified: false`); no hay evaluación independiente publicada.
- Ventana máxima de 256 tokens: documentos largos requieren troceado, con riesgo de perder entidades que crucen los límites de fragmento.
- Modelo exclusivamente de clasificación de tokens: no genera texto, no razona y no soporta tool calling; debe combinarse con otras etapas para anonimización efectiva.
- Riesgo de falsos positivos y negativos inherente a la detección de PII; en dominios muy específicos (jerga legal, formatos locales de identificadores) el rendimiento puede degradarse respecto a las cifras medias.
- Cobertura desigual entre idiomas: griego (95,42 %) y maltés (95,78 %) están en el límite inferior declarado, frente a irlandés (97,98 %).
- Licencia restrictiva para uso comercial: prueba gratuita de 30 días, licencia anual obligatoria después; uso académico gratuito. El metadato indica Apache-2.0 pero la licencia efectiva es `commercial-evaluation`, lo que puede generar confusión; conviene revisar LICENSE.md antes de desplegar.
- Acceso gated: requiere aceptar la licencia y proporcionar organización, email y país en Hugging Face.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que dificulta evaluar robustez ante dominios no representados.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de errores de clasificación que podrían dejar PII sin enmascarar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabularisai/eu-pii-safeguard
- Licencia: https://huggingface.co/tabularisai/eu-pii-safeguard/blob/main/LICENSE.md
- Sitio de Tabularis AI: https://tabularis.ai
- Modelo base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Contacto del autor: info@tabularis.ai
