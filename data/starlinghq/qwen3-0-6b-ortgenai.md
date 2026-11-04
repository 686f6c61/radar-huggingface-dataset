# Starlinghq/qwen3-0.6b-ortgenai

## Resumen

Starlinghq/qwen3-0.6b-ortgenai es una conversión a ONNX Runtime GenAI del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el proyecto Starling (starlinghq). No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue que empaqueta los pesos originales en formato ONNX con la configuración de GenAI, pensado para ser consumido por el paquete .NET `Starlings.Models.QwenChat` del repositorio starlinghq/starling, bajo el perfil `qwen3-0.6b/ortgenai-fp32-cpu`.

La build se generó con el model builder de onnxruntime-genai 0.17.1 (commit `83de55a1f3886cddbb32a5517e26adb3f9d65159`) usando los flags `-p fp32 -e cpu`, es decir, precisión completa en coma flotante de 32 bits y ejecución sobre CPU. Se partió de Qwen/Qwen3-0.6B en la revisión fijada `c1899de289a04d12100db370d81485cdf75e47ca`, y se usó una copia de `config.json` que declara float32 para evitar cualquier redondeo de pesos durante el proceso de conversión.

Su relevancia es acotada pero concreta: ofrece una ruta reproducible y verificable por hash para ejecutar Qwen3-0.6B en entornos .NET sin GPU, con integridad de ficheros garantizada mediante `SHA256SUMS`. El repositorio ocupa 2,4 GB, coherente con pesos fp32 de un modelo de 0,6 mil millones de parámetros más los ficheros de tokenizador y configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 0,6 mil millones (según denominación del modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (depende de la configuración del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | Solo fp32 en esta build (`-p fp32`); no se incluyen variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`) con `genai_config.json`; tokenizador en `tokenizer.json` y `tokenizer_config.json`; plantilla de chat en `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-0.6B de Alibaba Qwen, un transformer decoder-only de 0,6 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen/Qwen3-0.6B, que no se incluye en esta ficha.

La innovación técnica de este artefacto no está en el modelo sino en el pipeline de conversión y empaquetado. La build es reproducible mediante `model-pipeline/reference/qwen-chat/build_bundle.py` del repositorio starlinghq/starling, que registra la misma estampa del builder wherever se ejecute. El paquete .NET fija cada fichero por tamaño y SHA-256 a través de `SHA256SUMS`, de modo que cualquier fichero alterado se rechaza. La revisión r2 difiere de r1 únicamente en el header `producer_version` de `model.onnx` (`0.17.1+83de55a` frente a `0.17.1+1bada25`); los pesos y el resto de ficheros son idénticos byte a byte. La r1 permanece en el repositorio en el commit `c24cd59cad1444863ddfdb372736da610a09c9c4` para paquetes hasta la versión 0.5.0.

## Capacidades

- Generación de texto conversacional: el bundle incluye `chat_template.jinja` extraído sin modificar de `tokenizer_config.json`, lo que habilita el formateo de turnos de chat según la plantilla original de Qwen3.
- Razonamiento y código: hereda las capacidades del modelo base Qwen3-0.6B; no se documentan evaluaciones específicas en la información disponible.
- Ejecución en CPU: la build está compilada con `-e cpu`, por lo que el grafo ONNX está orientado a inferencia sin GPU.
- Integración con .NET: diseñado para el paquete `Starlings.Models.QwenChat` del repositorio starlinghq/starling, perfil `qwen3-0.6b/ortgenai-fp32-cpu`.
- Verificación de integridad: los ficheros se validan por tamaño y SHA-256 en el consumo desde .NET.
- Tool calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada para esta build concreta.

## Casos de uso

- Inferencia local en aplicaciones .NET de escritorio: el paquete `Starlings.Models.QwenChat` permite cargar el modelo y ejecutar chat sobre CPU sin dependencias de GPU, adecuado para herramientas internas o utilidades de línea de comandos donde no hay acelerador disponible.
- Despliegue en servidores sin GPU: al ser fp32 y CPU, el modelo puede ejecutarse en instancias cloud básicas o en contenedores sin acceso a CUDA, simplificando el aprovisionamiento.
- Pruebas de integración y CI: la verificación por SHA-256 y la reproducibilidad del build permiten fijar el artefacto en pipelines y detectar alteraciones de ficheros, lo que resulta útil para tests de regresión de la capa de inferencia.
- Prototipado de asistentes conversacionales: con 0,6 mil millones de parámetros, sirve para validar flujos de chat multi-turno y plantillas de prompt antes de migrar a modelos mayores.
- Educación y experimentación: el tamaño reducido y la licencia Apache-2.0 facilitan su uso en entornos docentes para estudiar el pipeline ONNX Runtime GenAI de extremo a extremo.
- Generación de texto de bajo coste en el borde: para tareas de resumen corto o clasificación textual en dispositivos con CPU, el modelo ofrece una huella de 2,4 GB en disco que cabe en muchos equipos de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en esta build, que está compilada para CPU (`-e cpu`).
- Memoria RAM: el repositorio ocupa 2,4 GB en fp32; se recomienda al menos 4 GB de RAM libre para cargar el grafo y el tokenizador con margen.
- GPU recomendadas: no aplica para esta build concreta; para variantes GPU de Qwen3-0.6B habría que generar artefactos con `-e cuda` o `-e dml`, no incluidos aquí.
- Cabe en consumer GPU: no aplica; el artefacto es de CPU.
- Opciones de despliegue: ONNX Runtime GenAI (librería `onnxruntime-genai`) y el paquete .NET `Starlings.Models.QwenChat`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/qwen3-0.6b-ortgenai | 0,6 B | no disponible | ONNX (fp32, CPU) | Apache-2.0 | Build de despliegue verificada por SHA-256; pensada para .NET |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible | safetensors | Apache-2.0 | Modelo base original; requiere conversión para ONNX Runtime GenAI |
| Otras builds ONNX de Qwen3-0.6B | 0,6 B | no disponible | ONNX | Apache-2.0 | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del Qwen3-0.6B original (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios.
- Solo fp32: el artefacto no incluye cuantizaciones int8 o int4, por lo que el consumo de disco y RAM es mayor que el de variantes cuantizadas equivalentes.
- Solo CPU: la build no está optimizada para GPU; usarla en un entorno con acelerador no aprovecharía el hardware.
- Acoplamiento al ecosistema Starling: el consumo previsto es a través del paquete .NET `Starlings.Models.QwenChat`, con verificación estricta por SHA-256; modificar cualquier fichero rompe la validación.
- Idiomas soportados no documentados en esta ficha: conviene consultar la model card de Qwen/Qwen3-0.6B antes de desplegar en producción multilingüe.
- Contexto máximo no documentado aquí: debe verificarse en la configuración del modelo base para dimensionar correctamente las conversaciones.
- Sin benchmarks publicados para esta build: el rendimiento real en CPU depende del hardware y de la implementación de ONNX Runtime GenAI.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Starlinghq/qwen3-0.6b-ortgenai
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio Starling: https://github.com/starlinghq/starling
- Revisión fijada del modelo base: `c1899de289a04d12100db370d81485cdf75e47ca`
- Commit r1 en el repositorio: `c24cd59cad1444863ddfdb372736da610a09c9c4`
- Commit del builder onnxruntime-genai: `83de55a1f3886cddbb32a5517e26adb3f9d65159`
