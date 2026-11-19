# UGREENDEV/RK1828-LLM-Hunyuan-MT-7B

## Resumen

RK1828-LLM-Hunyuan-MT-7B es una conversión al formato RKNN del modelo de traducción multilingüe Hunyuan-MT-7B de Tencent, publicada por el usuario UGREENDEV. El modelo original es el primer modelo de traducción multilingüe de código abierto de Tencent, diseñado para traducción bidireccional entre 33 idiomas principales, con especial énfasis en la traducción entre mandarín y lenguas minoritarias de China, así como dialectos. Esta versión concreta está empaquetada para ejecutarse sobre el acelerador NPU RK1828 mediante el runtime RKNN v1.1.0.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: un LLM de 7B parámetros cuantizado a w4a16 y compilado para un chip específico (RK1828), con una ventana de contexto limitada a 3584 tokens y KVCache en fp16. Esto lo convierte en una pieza de interés para integradores de hardware embebido y sistemas edge que necesiten capacidades de traducción local sin depender de la nube.

El repositorio ocupa 5,6 GB e incluye únicamente un directorio de configuración (`Hunyuan-MT-7B-w4a16-8-3584`), junto con los ficheros de licencia y avisos. No se han publicado resultados de benchmarks propios en la información disponible, y el modelo no cuenta todavía con descargas ni valoraciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Hunyuan-MT-7B; detalles de arquitectura interna no disponibles) |
| Parámetros totales | 7B (según denominación del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 3584 tokens |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | 33 idiomas principales (modelo base); lista concreta no disponible |
| Licencia | other (Tencent Hunyuan Community License Agreement) |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF en este repo |
| Cores NPU | 8 |
| KVCache | fp16 |
| Chips soportados | RK1828 |
| Versión del runtime | RKNN v1.1.0 |
| Tamaño del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Hunyuan-MT-7B, un transformer de 7B parámetros desarrollado por Tencent y orientado específicamente a traducción automática multilingüe. Según el informe técnico referenciado, soporta traducción bidireccional entre 33 idiomas principales y presta atención especial a la traducción entre mandarín y lenguas minoritarias de China y dialectos. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta publicación no contiene los pesos originales, sino una compilación RKNN para el chip RK1828 con cuantización w4a16, 8 cores NPU y KVCache en fp16. La conversión la realiza la cadena de herramientas RKNN Toolkit, y el artefacto resultante solo es ejecutable con el runtime y driver RKNN correspondientes (v1.1.0). No se documentan innovaciones técnicas adicionales más allá de la propia cuantización y el despliegue en NPU.

## Capacidades

- Traducción automática multilingüe bidireccional entre 33 idiomas principales (según el modelo base).
- Énfasis en traducción entre mandarín y lenguas minoritarias de China, así como dialectos.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Ejecución local en NPU RK1828 con cuantización w4a16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Traducción local en dispositivos embebidos: el modelo puede ejecutarse íntegramente en el NPU RK1828 sin conexión a la nube, lo que resulta adecuado para dispositivos de traducción portátiles o electrodomésticos con requisitos de privacidad.
- Traducción de documentación técnica entre idiomas: con una ventana de 3584 tokens, permite traducir secciones de manuales o guías de forma fragmentada, manteniendo coherencia dentro de cada bloque.
- Localización de interfaces de usuario: integración en pipelines de build para generar cadenas traducidas a los 33 idiomas soportados por el modelo base, siempre que el hardware destino sea RK1828.
- Asistentes de conversación multilingües en kioscos o terminales de atención: el tag `conversational` y el pipeline de generación de texto permiten gestionar diálogos multi-turno dentro del límite de contexto.
- Traducción de correspondencia y comunicaciones internas en entornos con requisitos de soberanía de datos: al ejecutarse en local, evita el envío de contenido sensible a servicios externos.
- Evaluación y prototipado de hardware RK1828: útil para equipos que necesiten validar el rendimiento de la NPU con un LLM real antes de comprometerse con un diseño de producto.
- Traducción de subtítulos o textos cortos en aplicaciones de medios: la latencia dependerá del runtime RKNN y del chip, aunque no se han publicado cifras concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip obligatorio: RK1828 (único chip soportado).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar con `rknn-smi -v` en el dispositivo antes de ejecutar.
- Cores NPU utilizados: 8.
- Memoria: el repositorio ocupa 5,6 GB; con cuantización w4a16 y KVCache fp16, el consumo de memoria del dispositivo debe dimensionarse según la configuración, aunque no se publica una cifra exacta de VRAM/RAM.
- GPU de escritorio (A100, H100, RTX 4090): no aplicable; este artefacto no está pensado para GPUs convencionales.
- Despliegue: exclusivamente mediante el runtime RKNN; no se soportan vLLM, llama.cpp, Ollama ni TGI con estos ficheros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK1828-LLM-Hunyuan-MT-7B (esta ficha) | 7B | 3584 tokens | RKNN (w4a16) | Tencent Hunyuan Community License | Hugging Face / ModelScope |
| Hunyuan-MT-7B (original) | 7B | no disponible | safetensors (presumiblemente) | Tencent Hunyuan Community License | ModelScope |
| Modelos de traducción edge de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (LLM de traducción compilados para NPU) no está disponible en la información proporcionada. El original Hunyuan-MT-7B es el referente inmediato, pero no se han encontrado en la búsqueda otros artefactos RKNN comparables.

## Limitaciones y advertencias

- Dependencia total del hardware RK1828: el modelo no puede ejecutarse en GPUs convencionales ni en CPU con los runtimes habituales.
- Contexto muy limitado (3584 tokens) en comparación con LLMs modernos, lo que restringe tareas de traducción de documentos largos.
- La cuantización w4a16 puede degradar la calidad de traducción respecto al modelo original en fp16/bf16; no se han publicado evaluaciones comparativas.
- Licencia "other": el uso está sujeto a la Tencent Hunyuan Community License Agreement, que puede imponer restricciones adicionales para uso comercial; es necesario revisar `LICENSE` y `Notice` en el repositorio.
- El uso también está sujeto a las licencias del RKNN Toolkit y del RKNN Runtime.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en idiomas de bajos recursos o dialectos.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero el modelo base podría reflejar sesgos de sus datos de entrenamiento.
- Idiomas exactos soportados: no se detalla la lista de los 33 idiomas en la información proporcionada.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta), lo que reduce la evidencia empírica sobre su funcionamiento.
- Es imprescindible verificar la integridad con `sha256sum -c SHA256SUMS` antes del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Hunyuan-MT-7B
- Modelo base en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-MT-7B
- Informe técnico de Hunyuan-MT (referencia citada en la búsqueda web): http://go/v1/AbMWDhGI7tllav7OfAFfqerhIDIic8_P0fr2-Qa9gSTyXxJc2VUH-qbjBA83HITw0006vKh9En1wfN6p4h2xise0tm3dbLxkUlbXGCfY1qkfwf-IJ4p-83Kt7GVHez1p0q7tGt2D-ZKsIfvr5RRUrFZ-zu0ygP7XGDot0q39JPK5ZSgRZR0PmAlOFPQVxBSzA7vE5Y4J
- Informe técnico de Hunyuan-MT (segunda referencia): http://go/v1/AbMWDhGI7tllav7OfAFfqerhIDIic8_P0fr2-Qa9gsVw3XY_QudGkR6TH9vakuIWW32A96VdWhcwlQXx9GurGY7lUafSJII0o4XPEZz1NCuotU-54KOPhLq6sx-CzIzpq5fBjS3e-YhbY1PG3DIwzTfD5P8TPgW69lamuexwYBZGzPIoya22BBNB055JyHmr4oEqBw
