# Wa1k3r/Inkling-2-Mini-NVFP4exp-Q8-draft-LexiSuite-AIO-for-AMD-RDNA

## Resumen

Inkling-2-Mini es un modelo de lenguaje desarrollado por Thinking Machines Lab, distribuido originalmente bajo licencia Apache-2.0. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) y diseño "looped-transformer", orientado a contexto largo (hasta 524.288 tokens) y generación de texto en inglés. El repositorio que nos ocupa no contiene el modelo original, sino una cuantización de 8 bits (Q8_0) con cabecera de borrador (draft head) para decodificación especulativa, empaquetada por el usuario Wa1k3r junto con LexiSuite, una plataforma de inferencia local escrita en Rust para GPUs AMD RDNA.

El interés de esta ficha reside en que el artefacto publicado es un paquete "todo en uno" para AMD Radeon: una imagen de sistema operativo arrancable desde USB (LexiOS con kernel Linux 7.4-rc4), el motor de inferencia (LexiEngine), el panel de control (LexiPanel) y el archivo GGUF del modelo. Está pensado para ejecutarse en una RX 7900 XTX de 24 GB con cachés KV de 4 bits, no en el ecosistema NVIDIA habitual.

Conviene subrayar que la información disponible es la model card del autor de la cuantización, no la del modelo base. Los datos de arquitectura, entrenamiento y benchmarks del Inkling-2-Mini original no se detallan en esta fuente, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y diseño looped-transformer; cuantización Q8_0 con draft head para decodificación especulativa |
| Parámetros totales | 26.388.288.144 (26,4 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 524.288 tokens (según la model card, en 24 GB de VRAM) |
| Tipos de cuantización | Q8_0 (8 bits) sobre pesos con formato NVFP4 experimental; cachés KV de 4 bits |
| Idiomas soportados | inglés (en) |
| Licencia | lexisuite-license (licencia propia del empaquetador); el modelo base es Apache-2.0 |
| Formato de pesos | GGUF (archivo `Inkling-2-Mini-NVFP4exp-Q8-draft.gguf`, 18.263.767.488 bytes) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un mixture-of-experts con arquitectura de transformer "looped" (capas reutilizadas en bucle), lo que permite aumentar la profundidad efectiva sin multiplicar el número de parámetros. El paquete publicado aplica una cuantización Q8_0 sobre una variante NVFP4 experimental y añade una cabecera de borrador (draft head) que habilita decodificación especulativa dentro de LexiEngine. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovación técnica destacable de este artefacto no está en el modelo en sí, sino en el entorno: LexiSuite integra un motor de inferencia propio en Rust, un panel de control web, un sistema operativo de appliance arrancable desde USB y un kernel Linux 7.4-rc4 adaptado a inferencia, todo orientado a GPUs AMD RDNA3 (RX 7900 XTX). El soporte de Secure Boot se resuelve mediante un certificado de desarrollo (`LexiSuite-Development-SecureBoot.der`/`.pem`) que debe inscribirse en el firmware o desactivar Secure Boot.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento de múltiples pasos y contexto largo: la ventana de 524.288 tokens permite procesar documentos extensos o historiales de conversación muy largos.
- Decodificación especulativa mediante draft head integrada en el archivo GGUF, pensada para acelerar la generación en LexiEngine.
- Ejecución local en GPU AMD RDNA (Vulkan), sin dependencia de CUDA.
- Despliegue como appliance: arranque desde USB, panel de control web y modelo precargado en la carpeta de modelos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el modelo se ejecuta íntegramente en una RX 7900 XTX mediante LexiEngine y Vulkan, sin enviar datos a la nube; adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos largos: con 524.288 tokens de contexto, se pueden cargar manuales, expedientes o bases de código completas en una sola pasada para resumen, extracción de entidades o preguntas y respuestas sobre el contenido.
- Despliegue en hardware de consumo sin NVIDIA: el paquete todo en uno convierte un PC con Radeon RDNA3 en un servidor de inferencia arrancable desde USB, útil para demos, laboratorios y entornos de formación.
- Prototipado de agentes con razonamiento multi-paso: la ventana larga y la decodificación especulativa permiten mantener cadenas de razonamiento extensas con latencia reducida en comparación con decodificación autoregresiva estándar.
- Evaluación de cuantizaciones y motores de inferencia: el repositorio incluye el GGUF aislado y una imagen sin modelo, lo que facilita comparar LexiEngine con otras implementaciones sobre el mismo archivo.
- Recuperación de información aumentada (RAG) en local: el contexto largo reduce la necesidad de trocear documentos y permite inyectar muchos fragmentos recuperados en un único prompt.
- Sustitución de servicios en la nube en pymes con parque AMD: el appliance evita costes recurrentes de API y mantiene el control sobre los datos, a cambio de gestionar el hardware y las actualizaciones del sistema.

## Benchmarks y rendimiento

La model card incluye una sección de mediciones en una Radeon RX 7900 XTX (24 GB, cachés KV de 4 bits, 23 de noviembre de 2026) con columnas de tokens de prompt, velocidad de lectura de prompt y decodificación simple. Sin embargo, el contenido citado se interrumpe antes de reproducir los valores numéricos, por lo que no es posible presentar la tabla de resultados.

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor reporta contexto de 524.288 tokens en 24 GB con cachés KV de 4 bits; el archivo GGUF pesa 18,26 GB, por lo que se requiere una GPU con al menos 24 GB para el contexto máximo.
- GPU recomendadas: Radeon RX 7900 XTX (24 GB) es la plataforma de referencia medida; el soporte declarado es AMD RDNA3 con Vulkan.
- GPU de consumo: encaja en tarjetas AMD de gama alta con 24 GB; no se documenta compatibilidad con GPUs NVIDIA ni con tarjetas de menos VRAM.
- Espacio en disco: la imagen todo en uno comprimida ocupa 17.638.065.732 bytes y 23 GB descomprimida, por lo que se necesita un USB de 32 GB o mayor; la imagen sin modelo son 352.984.188 bytes comprimidos y 3 GB descomprimidos.
- Opciones de despliegue: LexiEngine (motor propio en Rust) con LexiPanel como interfaz web; también se puede usar el GGUF aislado en otros motores compatibles, aunque no se detallan en la información disponible.
- Latencia y throughput: la model card anuncia mediciones de tokens por segundo en lectura de prompt y decodificación simple, pero los valores no están disponibles en el extracto proporcionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Inkling-2-Mini (esta cuantización) | 26,4 mil millones | 524.288 tokens | lexisuite-license (base Apache-2.0) | GGUF Q8_0, LexiEngine, Vulkan/AMD |
| Inkling-2-Mini-8Q-RCO-GPTQ (mismo autor) | 26,4 mil millones (base) | no disponible | no disponible en la información | GGUF con matrices de atención ajustadas por GPTQ |
| Modelo base thinkingmachines/Inkling-2-Mini | 26,4 mil millones | no disponible | Apache-2.0 | safetensors (pesos originales) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría; la comparativa se limita a parámetros, contexto, licencia y formato de distribución.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está documentado.
- Licencia: el paquete se distribuye bajo `lexisuite-license`, una licencia propia distinta de la Apache-2.0 del modelo base; es imprescindible revisar sus términos antes de un uso comercial.
- Estado del proyecto: la model card marca el build como "development", con certificado de Secure Boot de desarrollo que debe inscribirse manualmente o desactivar Secure Boot.
- Plataforma restringida: el despliegue documentado se limita a AMD RDNA3 con Vulkan; no hay garantías en otras GPUs ni en CPU.
- Riesgo de alucinación: no se documentan evaluaciones de fiabilidad ni tasas de error; como en cualquier modelo generativo, es necesario validar las salidas en producción.
- Sesgos: no se proporciona información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Cuantización: la combinación de pesos NVFP4 experimentales con Q8_0 y cachés KV de 4 bits puede degradar la calidad frente a los pesos originales; no se publican tablas de precisión en esta ficha (sí en el repositorio hermano GPTQ).
- Datos incompletos: no se especifican parámetros activos, número de tokens de entrenamiento ni resultados de benchmarks, lo que dificulta una evaluación rigurosa previa a producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Wa1k3r/Inkling-2-Mini-NVFP4exp-Q8-draft-LexiSuite-AIO-for-AMD-RDNA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LexiSuite en Hugging Face: https://huggingface.co/Wa1k3r/LexiSuite
- Variante GPTQ del mismo autor: https://huggingface.co/Wa1k3r/Inkling-2-Mini-8Q-RCO-GPTQ
- Licencia LexiSuite: https://huggingface.co/Wa1k3r/LexiSuite/blob/main/LICENSE
- Sitio y descargas: https://lexipanel.com/ y https://lexipanel.com/download/
- Documentación: https://lexipanel.com/docs/
- Wiki del proyecto: https://github.com/W61k3r/LexiSuite-Releases/wiki
- Releases anteriores: https://github.com/W61k3r/LexiSuite-Releases/releases
