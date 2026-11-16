# WWRJ-2025/Edge0-35B-IRIDIS

## Resumen

Edge0-35B-IRIDIS es un directorio de assets para el motor de inferencia edge0-infer, publicado por el usuario WWRJ-2025 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo original Edge0/Edge0-35B-A3B-preview (revision e21098e7faa916a00f5493795f12f20497d032bb) al formato de assets que consume la aplicación Android IRIDIS (com.iris.localai, a partir de la versión 2.6.5, como funcionalidad experimental).

El modelo subyacente es un MoE de 35B parámetros totales con aproximadamente 3B parámetros activos, construido sobre la base Qwen3.6-35B-A3B según indica la model card. El pipeline de conversión aplica cuantización int4, una técnica denominada Recover-LoRA y un componente llamado prerouter. La conversión se realizó con la herramienta oficial make_assets.py del repositorio edge0-infer, sin modificar los pesos, con verificación sha256 mediante source.lock.json y validación con check.py.

Su relevancia es acotada pero específica: permite ejecutar un modelo MoE de 35B en dispositivos Android de gama alta exclusivamente por CPU, algo poco habitual en el ecosistema open source. El repositorio declara explícitamente que no ha sido probado en dispositivo real, por lo que las cifras de rendimiento deben tomarse de la documentación oficial de Edge0 y no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base Qwen3.6-35B-A3B |
| Parametros totales | 35B (denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | ~3B (denominacion A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (con Recover-LoRA y prerouter) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | assets propietarios de edge0-infer (no es GGUF cargable por llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE): 35B parámetros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional por inferencia a costa de mantener el estado completo en memoria. El modelo original Edge0-35B-A3B-preview se construye sobre Qwen3.6-35B-A3B y aplica un proceso de cuantización int4 combinado con Recover-LoRA (un ajuste LoRA orientado a recuperar calidad tras la cuantización) y un componente prerouter cuya función exacta no está documentada en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card de este repositorio no describe el entrenamiento, solo el proceso de conversión: uso de make_assets.py (implementado en numpy) del repositorio oficial edge0-infer, verificación de integridad mediante sha256 contra source.lock.json y validación del resultado con check.py. Los metadatos de procedencia están en provenance.json y el manifiesto de ficheros en assets.tsv.

## Capacidades

- Generación de texto en chino e inglés, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y conocimiento general propios de un modelo de 35B parámetros totales con 3B activos.
- Ejecución en dispositivo Android de forma local, sin conexión a servidores externos.
- Inferencia exclusivamente por CPU mediante el motor edge0-infer.
- Capacidades de tool calling, agentes o visión: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional offline en Android: la aplicación IRIDIS descarga el directorio completo de assets y ejecuta el modelo en local, lo que permite conversaciones sin conexión y sin enviar datos a terceros en dispositivos con arm64 e i8mm.
- Procesamiento de texto confidencial en movilidad: al ejecutarse íntegramente en el dispositivo, es adecuado para resumir o redactar documentos sensibles sin salida de datos a la nube.
- Prototipado de aplicaciones edge con MoE: sirve para evaluar el comportamiento de un MoE de 35B con 3B activos en hardware móvil antes de comprometerse con infraestructura de servidor.
- Integración en flujos de trabajo con requisitos de privacidad: útil en entornos donde la normativa impide el envío de texto a APIs externas, como sanidad o legal, siempre que el dispositivo cumpla los requisitos de CPU.
- Investigación sobre cuantización int4 y Recover-LoRA: el repositorio documenta el pipeline de conversión y permite reproducir la generación de assets para estudiar la pérdida de calidad asociada a la cuantización.
- Distribución de modelos en apps móviles: el formato de directorio con manifiesto assets.tsv y hashes facilita la descarga íntegra y la verificación de integridad en el cliente, un patrón reutilizable para otras apps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de rendimiento deben consultarse en la documentación oficial de Edge0 y que el autor del repositorio no ha realizado pruebas en dispositivo real.

## Requisitos de hardware

- Plataforma: Android con CPU arm64 y extensión i8mm; requiere Snapdragon 8 Gen 2, Dimensity 9200 o posteriores según la model card.
- GPU: no se utiliza GPU; la inferencia es exclusivamente por CPU.
- VRAM: no aplica; el requisito relevante es memoria RAM del dispositivo, cuyo mínimo no está especificado en la información disponible.
- Motor de despliegue: exclusivamente edge0-infer; no es compatible con llama.cpp, vLLM, Ollama ni TGI, ya que el formato no es GGUF estándar.
- Latencia y throughput: no disponibles; no hay mediciones propias en el repositorio y las oficiales de Edge0 no se incluyen en la información proporcionada.
- Estado de validación: no probado en dispositivo real según declara el propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Edge0-35B-IRIDIS | 35B totales, ~3B activos (MoE) | no disponible | Apache-2.0 | assets edge0-infer, solo CPU Android |
| Qwen3.6-35B-A3B (base declarada) | 35B totales, ~3B activos (MoE) | no disponible | no disponible en la informacion | pesos originales, ecosistema estandar |
| Edge0/Edge0-35B-A3B-preview | 35B totales, ~3B activos (MoE) | no disponible | Apache-2.0 | pesos originales del equipo Edge0 |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada. La diferencia principal entre ellas es el formato y el motor de ejecución, no la arquitectura.

## Limitaciones y advertencias

- El repositorio no ha sido probado en dispositivo real; la funcionalidad y el rendimiento no están verificados por el autor de la conversión.
- El formato no es GGUF estándar: no puede cargarse en llama.cpp, Ollama, vLLM ni TGI, lo que limita su uso fuera del motor edge0-infer.
- Requiere hardware específico (arm64 con i8mm); no funciona en dispositivos Android más antiguos ni en x86.
- Solo soporta chino e inglés; no hay soporte declarado de castellano.
- La cuantización int4 con Recover-LoRA puede degradar la calidad respecto al modelo original, aunque no se aportan métricas de la pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información proporcionada, conviene verificar la licencia del modelo original antes de distribuirlo en producción.
- La aplicación IRIDIS trata la funcionalidad como experimental desde la versión 2.6.5.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WWRJ-2025/Edge0-35B-IRIDIS
- Modelo base: https://huggingface.co/Edge0/Edge0-35B-A3B-preview
- Repositorio del motor edge0-infer: no disponible como URL en la información proporcionada (se menciona el directorio edge0-infer/tools/assets/edge0_35b/make_assets.py)
