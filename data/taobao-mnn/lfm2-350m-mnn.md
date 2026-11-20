# taobao-mnn/LFM2-350M-MNN

## Resumen

LFM2-350M-MNN es un paquete de inferencia en formato MNN del modelo LiquidAI/LFM2-350M, convertido y publicado por el equipo taobao-mnn. No se trata de un modelo nuevo, sino de una versión cuantizada a 4 bits mediante HQQ (Half-Quadratic Quantization) del modelo base de LiquidAI, empaquetada para su ejecución con el runtime MNN en CPU. El objetivo es permitir el despliegue de un modelo de lenguaje compacto de 350 millones de parámetros en entornos con recursos limitados, sin necesidad de GPU.

El modelo base LFM2-350M emplea la arquitectura `lfm2` de LiquidAI, con 16 capas, y está orientado a generación de texto en chino e inglés. La conversión mantiene el tokenizador y la configuración de muestreo originales, pero sustituye los pesos por versiones cuantizadas de 4 bits con grupo de 64, incluyendo la cabeza de salida LM y los embeddings de entrada, que comparten los pesos cuantizados de dicha cabeza.

La relevancia de esta ficha radica en que documenta una opción de despliegue en CPU para un modelo pequeño, con licencia restrictiva para uso comercial a partir de cierto umbral de facturación. El paquete está pensado para integrarse en aplicaciones móviles o de escritorio mediante MNN, y su verificación se ha limitado a CPU x64, quedando sin validar ARM, GPU y dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (16 capas) |
| Parametros totales | 350 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no verificada en el paquete) |
| Tipos de cuantizacion | HQQ 4-bit, grupo=64, alpha_bytes=2 (FP16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0) |
| Formato de pesos | MNN (paquete de inferencia); modelo base en safetensors |
| Tamano del repo | 0,4 GB |
| Runtime verificado | MNN 3.6.2, commit 2c0b58a001bd13dbb9cfac98a533e2e7e96b1b44 |
| Configuracion por defecto | CPU, thread_num=4, precision=low, memory=low |

## Arquitectura y entrenamiento

El modelo base LFM2-350M utiliza la arquitectura `lfm2` de LiquidAI, un transformer de 16 capas con 350 millones de parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El paquete MNN no reentrena el modelo: únicamente convierte los pesos originales a un formato cuantizado de 4 bits mediante HQQ, con grupo de 64 y escalas en FP16 (alpha_bytes=2).

La innovación técnica del paquete reside en la cuantización HQQ aplicada tanto al backbone del lenguaje como a la cabeza de salida LM, con embeddings de entrada que comparten los pesos cuantizados de la cabeza. La conversión se realizó a partir de un modelo fuente FP32 y un mapeo alineado, con commit de conversión `b0239771b07b317a258fbc384683bbd540741406`; el paquete actual no se reconvirtió en la última revisión. La verificación se realizó el 2026-11-20 en CPU x64 con cuatro casos de prueba, con comprobaciones exactas en modo greedy/high/8 hilos y configuración por defecto real, obteniendo EOS natural; solo el caso `long_translation` falló en precisión exacta, lo que fue aceptado manualmente.

## Capacidades

- Generación de texto en chino e inglés.
- Razonamiento básico y respuesta a instrucciones, con la limitación documentada de que entradas largas pueden ignorar instrucciones.
- Ejecución en CPU sin GPU, gracias al runtime MNN y a la cuantización de 4 bits.
- Integración en aplicaciones mediante el binario `llm_demo` de MNN.
- Soporte de plantilla de chat y parámetros de muestreo definidos en `config.json` y `llm_config.json`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documenta soporte multilingüe más allá de chino e inglés.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones de escritorio: el paquete MNN permite ejecutar el modelo en CPU con 4 hilos y configuración de baja memoria, adecuado para integrarse en herramientas locales sin GPU.
- Traducción automática zh-en en entornos con recursos limitados: el modelo soporta ambos idiomas, aunque el caso `long_translation` presenta fallos de precisión exacta documentados, por lo que se recomienda para frases cortas y revisión humana.
- Prototipado rápido de chatbots: al ser un paquete de 0,4 GB y ejecutarse en CPU, permite validar flujos conversacionales antes de migrar a modelos mayores.
- Generación de texto auxiliar en dispositivos de borde: la cuantización de 4 bits y el runtime MNN están orientados a despliegues con memoria reducida, si bien ARM y móvil no han sido verificados.
- Filtrado y clasificación de texto simple: tareas de etiquetado o resumen breve en chino e inglés donde no se requiera contexto largo.
- Educación y experimentación: modelo pequeño y ligero para estudiar el funcionamiento de la cuantización HQQ y del runtime MNN en pipelines de inferencia locales.
- Generación de respuestas en asistentes de voz integrados: el tamaño reducido permite incluirlo en sistemas de diálogo con latencia baja, aunque no se han publicado métricas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la verificación funcional de cuatro casos en CPU x64 (greedy/high/8 hilos y configuración por defecto), con EOS natural y un fallo aceptado en `long_translation`; no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración por defecto, que se ejecuta en CPU; no se dispone de estimación para GPU.
- GPU recomendadas: no verificadas; la model card indica que GPU y dispositivos móviles no han sido validados.
- Cabe en GPU de consumo: no disponible; el paquete está orientado a CPU.
- Memoria: configuración por defecto con `memory=low` y `precision=low`; el repo ocupa 0,4 GB.
- Opciones de despliegue: runtime MNN 3.6.2 con `MNN_BUILD_LLM` y `MNN_LOW_MEMORY`, binario `llm_demo`; también disponible vía ModelScope.
- Latencia y throughput: no disponibles; no se han publicado métricas.
- ARM FP16, GPU, móvil y contexto máximo: no verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-350M-MNN (este paquete) | 350 M | no disponible | HQQ 4-bit | LFM Open License v1.0 | Hugging Face, ModelScope |
| LiquidAI/LFM2-350M (base) | 350 M | no disponible | FP32/FP16 original | LFM Open License v1.0 | Hugging Face, ModelScope |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos de la misma categoría, por lo que la comparativa se limita a la relación entre el paquete cuantizado y su modelo base.

## Limitaciones y advertencias

- Entradas largas pueden ignorar instrucciones, según advierte la propia model card.
- El caso `long_translation` falla en precisión exacta; el resultado automático de precisión sigue siendo falso y el fallo fue aceptado manualmente.
- La verificación se limita a CPU x64; ARM FP16, GPU, dispositivos móviles, contexto máximo y rendimiento no han sido validados.
- No se declara precisión global del modelo; los resultados por defecto son solo orientativos.
- Licencia LFM Open License v1.0: el uso comercial requiere cumplir la Sección 5, con umbral de facturación anual de 10 millones de dólares; por encima de ese umbral no se autoriza el uso comercial, salvo excepciones para organizaciones sin ánimo de lucro con fines no comerciales o de investigación.
- La conversión cuantizada no amplía la autorización del modelo original; la licencia de las herramientas MNN no sustituye la licencia del modelo.
- Riesgo de alucinación inherente a un modelo de 350 millones de parámetros; no se documentan sesgos específicos.
- No se deben mezclar revisiones del paquete; debe conservarse `config.json` y `llm_config.json` con la configuración de muestreo, contexto y plantilla.
- Solo se soportan chino e inglés; no hay soporte documentado de otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/LFM2-350M-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/LiquidAI/LFM2-350M/summary
- Repositorio MNN: no disponible en la información proporcionada
- Paper o blog de LiquidAI: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
