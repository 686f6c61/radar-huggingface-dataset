# UGREENDEV/RK182X-LLM-Qwen3-0.6B

## Resumen

RK182X-LLM-Qwen3-0.6B es un modelo de lenguaje convertido al formato RKNN por UGREENDEV a partir de Qwen/Qwen3-0.6B, el modelo denso de 0,6 mil millones de parametros de la familia Qwen3 de Alibaba. No se trata de un modelo nuevo entrenado desde cero, sino de una compilacion optimizada para ejecutarse sobre la NPU del chip Rockchip RK1828, con cuantizacion de pesos a 4 bits (w4a16) y soporte de hasta 8 nucleos NPU. El repositorio incluye dos configuraciones distintas segun el tipo de KVCache empleado.

La relevancia de esta publicacion es practica: permite desplegar un LLM conversacional en hardware de borde (edge) basado en RK1828 sin necesidad de GPU dedicada ni de infraestructura cloud. Las dos configuraciones disponibles ofrecen ventanas de contexto de 37.376 tokens (con KVCache en fp16) y 82.432 tokens (con KVCache en int4), lo que cubre escenarios de conversacion multi-turno y procesamiento de documentos de longitud media en dispositivos empotrados.

El modelo hereda las capacidades del Qwen3-0.6B original (generacion de texto, razonamiento basico, soporte multilingue y modo thinking), pero empaquetadas en un formato propietario RKNN que requiere el runtime y el driver correspondientes de Rockchip. La licencia Apache 2.0 del modelo base se mantiene, aunque se anaden los terminos de licencia del RKNN Toolkit y del RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B), compilada a RKNN |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 37.376 tokens (KVCache fp16) / 82.432 tokens (KVCache int4) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache fp16 o int4 |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue, pero la model card no lo detalla) |
| Licencia | Apache 2.0 (modelo base); se anaden terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (no safetensors ni GGUF); runtime v1.1.0 |
| Chip soportado | Rockchip RK1828 (8 nucleos NPU) |
| Version de runtime | RKNN Runtime v1.1.0 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-0.6B original: un transformer denso decoder-only de 0,6 mil millones de parametros. UGREENDEV no ha reentrenado el modelo; la aportacion consiste en la conversion y compilacion a RKNN para el acelerador NPU RK1828, con cuantizacion de pesos a 4 bits (w4a16) distribuida en 8 nucleos NPU. La model card no documenta el proceso de calibracion de la cuantizacion ni los datos empleados para ello.

Se ofrecen dos variantes de despliegue. La primera mantiene el KVCache en fp16 y soporta 37.376 tokens de contexto. La segunda comprime el KVCache a int4 y amplia la ventana a 82.432 tokens, a costa de una mayor perdida de precision en la cache. El repositorio incluye checksums SHA-256 por configuracion y manifiestos `config.json`, lo que facilita la verificacion de integridad antes del despliegue. No se detallan innovaciones tecnicas adicionales (decodificacion especulativa, attention lineal, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-0.6B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6B parametros.
- Soporte multilingue heredado del modelo base (la model card no especifica la lista de idiomas).
- Modo thinking de Qwen3, si la conversion RKNN lo preserva (no confirmado en la informacion disponible).
- Ejecucion en NPU de borde con 8 nucleos, sin GPU dedicada.
- Dos perfiles de contexto: 37,4k tokens (KVCache fp16) y 80,5k tokens (KVCache int4).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no soportadas (modelo exclusivamente de texto).

## Casos de uso

- Asistentes conversacionales en dispositivos empotrados: el modelo puede gestionar dialogos multi-turno con contexto de hasta 37,4k tokens en hardware RK1828, sin conexion a la nube ni GPU, lo que resulta adecuado para electrodomesticos inteligentes, paneles de control o dispositivos IoT con NPU.
- Procesamiento de documentos en el borde: con la configuracion de 80,5k tokens y KVCache int4, permite resumir o extraer informacion de documentos de longitud media directamente en el dispositivo, evitando enviar datos sensibles a servidores externos.
- Clasificacion y etiquetado de texto local: por su tamano reducido, es viable para tareas de categorizacion, analisis de sentimiento o extraccion de entidades en tiempo real sobre flujos de texto en dispositivos de borde.
- Generacion de respuestas en asistentes de voz integrados: al ejecutarse en NPU de bajo consumo, puede alimentar pipelines de ASR + LLM + TTS en dispositivos portatiles o wearables.
- Prototipado rapido en hardware Rockchip: sirve como referencia para desarrolladores que quieran validar un LLM en RK1828 antes de escalar a modelos mayores o integrar en producto.
- Filtrado y moderacion de contenido on-device: el modelo puede prefiltrar o resumir texto generado por usuarios en el propio dispositivo, reduciendo la latencia y el coste de red en aplicaciones de mensajeria o foros.
- Educacion y demos offline: util para entornos sin conectividad (aulas, ferias, dispositivos de demostracion) donde se necesita un chatbot funcional en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828 (8 nucleos NPU). El modelo no se ejecuta en GPU convencional ni en CPU mediante llama.cpp u Ollama, ya que el formato es RKNN propietario.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente. Verificar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 0,8 GB; el consumo en NPU depende de la configuracion elegida (KVCache fp16 o int4) y de la longitud de contexto activa.
- GPU recomendadas: no aplica; el modelo esta disenado exclusivamente para NPU RK1828.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no, el formato RKNN no es ejecutable en CUDA.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1828; descarga via ModelScope o Hugging Face (`hf download`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen3-0.6B (este) | 0,6B | 37,4k / 80,5k tokens | RKNN (w4a16) | NPU RK1828 | Apache 2.0 + terminos RKNN |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32.768 tokens (tipico en Qwen3) | safetensors | GPU/CPU | Apache 2.0 |
| Modelos GGUF de 0,5-1B (p. ej. Qwen2.5-0.5B-Instruct-GGUF) | 0,5B | variable segun cuantizacion | GGUF | CPU/GPU via llama.cpp | Apache 2.0 |

La comparativa con alternativas de la misma categoria (LLM de menos de 1B parametros para edge) es limitada porque este modelo es una compilacion especifica para un chip concreto, no un checkpoint generico. Su ventaja es la ejecucion en NPU RK1828; su desventaja, la ausencia de portabilidad a otros aceleradores.

## Limitaciones y advertencias

- Dependencia total del hardware RK1828: no es ejecutable en GPU, CPU ni en otros aceleradores; requiere RKNN Runtime v1.1.0 y driver compatible.
- Modelo de 0,6B parametros: capacidad de razonamiento y conocimiento factual limitada; propenso a errores en tareas complejas, matematicas avanzadas o codigo de produccion.
- Riesgo de alucinacion: inherente a los LLM de este tamano, agravado por la cuantizacion w4a16 y, en la variante de 80,5k tokens, por el KVCache en int4.
- Idiomas soportados no documentados en la model card; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- La cuantizacion a 4 bits puede degradar la calidad respecto al Qwen3-0.6B original; no se publican metricas de la perdida.
- Restricciones de licencia: ademas de la Apache 2.0 del modelo base, aplican los terminos del RKNN Toolkit y del RKNN Runtime, que pueden imponer condiciones adicionales para uso comercial.
- Verificar los checksums SHA-256 (`sha256sum -c SHA256SUMS`) antes del despliegue; usar siempre los ficheros de una misma configuracion juntos.
- Repositorio sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes): no hay evidencia de validacion por parte de la comunidad.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad sin pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK182X-LLM-Qwen3-0.6B
- Documentacion de configuracion (ingles): `Qwen3-0.6B-w4a16-8-37376/README.md` y `Qwen3-0.6B-w4a16-8-82432-kv-int4/README.md` dentro del repositorio
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
