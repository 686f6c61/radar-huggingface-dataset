# XxNoelW/Agora-1.0

## Resumen

Agora 1.0 es un modelo de generacion de texto de aproximadamente 1.500 millones de parametros desarrollado por Noel (usuario XxNoelW) como asistente integrado de Agora, un bot accesible desde navegador. Se trata de un fine-tune con QLoRA sobre Qwen2.5-1.5B-Instruct, el modelo instructivo de Alibaba Cloud, y se reentrena periodicamente con un conjunto creciente de "lecciones" curadas por el autor.

Su particularidad no esta en la arquitectura ni en el entrenamiento, sino en el formato de distribucion: el repositorio aloja unicamente los pesos MLC compilados en 4 bits (esquema `q4f16_1`) para ejecutarse integramente en el dispositivo del visitante mediante WebLLM sobre WebGPU, sin enviar datos a ningun servidor. El paquete pesa aproximadamente 0,9 GB y la ventana de contexto de esta build es de 4.096 tokens, con formato de chat ChatML.

Es relevante para desarrolladores interesados en inferencia local en navegador y en asistentes con privacidad por diseno, aunque conviene tener presente que se trata de un modelo pequeno, de nicho y sin benchmarks publicados. Los pesos en precision completa para Transformers se publican en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | aproximadamente 1,5 mil millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en esta build |
| Tipos de cuantizacion | q4f16_1 (4 bits, MLC); pesos completos en el repo -hf |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC compilado para WebGPU (repo principal); safetensors en el repo -hf (no verificado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con atencion por grupos (GQA) y RoPE, aunque la model card no detalla la configuracion exacta de capas, cabezas ni dimension oculta. El ajuste se realizo con QLoRA sobre un conjunto de "lecciones" curado por el autor, cuyo tamano, composicion y numero de tokens no se especifican. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion adicional mas alla de la ya presente en el modelo base.

La innovacion practica esta en el pipeline de despliegue: los pesos se compilan con MLC LLM al esquema `q4f16_1` y se sirven a traves de WebLLM, que ejecuta la inferencia sobre WebGPU en el navegador. El ejemplo de la model card referencia una libreria WASM concreta (`Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`), lo que confirma que la build reutiliza el grafo compilado del modelo base con contexto de 1K en la libreria y 4K declarados en la configuracion del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles con formato ChatML.
- Razonamiento basico y respuesta a instrucciones heredados de Qwen2.5-1.5B-Instruct.
- Generacion de codigo sencillo, limitada por el tamano del modelo.
- Ejecucion local en navegador mediante WebLLM y WebGPU, sin backend servidor.
- Funcionamiento offline una vez descargados los pesos (aproximadamente 0,9 GB).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente embebido en sitios web: el modelo se integra con `CreateMLCEngine` de WebLLM y responde en el propio navegador del visitante, de modo que ninguna consulta sale del dispositivo; adecuado para webs con requisitos de privacidad estrictos.
- Chat de soporte con datos sensibles: al no requerir backend, permite conversaciones multi-turno dentro de los 4.096 tokens de contexto sin exponer informacion del usuario a un servidor externo.
- Demos y prototipos de IA en navegador: sirve para validar interfaces conversacionales con WebGPU antes de invertir en infraestructura de inferencia.
- Aplicaciones de escritorio tipo Electron o PWA: los pesos MLC pueden empaquetarse para ofrecer un asistente offline en ingles dentro de una aplicacion instalable.
- Educacion y experimentacion: util como caso de estudio de fine-tuning QLoRA sobre un modelo de 1,5B y de compilacion a MLC para WebGPU.
- Generacion de texto auxiliar de baja latencia: borradores, resumenes cortos o respuestas plantilla en ingles donde el coste por token debe ser cero y la calidad no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso principal, ya que la inferencia ocurre en el navegador; en GPU integrada o dedicada se recomienda al menos 2-3 GB de memoria grafica disponible para los pesos de 4 bits y el estado de inferencia.
- GPU recomendadas para WebGPU: GPUs integradas modernas (Intel Iris Xe, AMD Radeon integradas) y dedicadas (NVIDIA GTX 16xx en adelante, RTX 20xx/30xx/40xx, AMD RX 6000/7000); el rendimiento depende del soporte WebGPU del navegador.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con WebGPU habilitado; tambien en moviles y portatiles recientes con Chrome o Edge actualizados.
- Opciones de despliegue: WebLLM (via MLC LLM) es la via documentada; los pesos completos del repo -hf permitirian en teoria desplegar con vLLM, TGI o llama.cpp, aunque no se documenta ni se verifica.
- Latencia y throughput: no disponibles; dependen del hardware del cliente y del soporte WebGPU del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue en navegador | Benchmarks publicados |
|---|---|---|---|---|---|
| Agora 1.0 | ~1,5B | 4.096 | Apache 2.0 | Si (WebLLM, q4f16_1) | No |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (modelo base) | Apache 2.0 | Si, via builds MLC de la comunidad | Si (ampliamente reportados) |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Si, via builds MLC | Si (ampliamente reportados) |
| Gemma 2 2B IT | 2,6B | 8.192 | Gemma Terms of Use | Parcial, via builds MLC | Si (ampliamente reportados) |

La comparativa se limita a datos de catalogo de cada familia; no se dispone de resultados de Agora 1.0 frente a estas alternativas, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Modelo de 1,5B parametros: alta probabilidad de errores factuales y alucinaciones; el propio autor recomienda verificar respuestas importantes.
- Solo ingles declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto efectivo de 4.096 tokens en esta build, muy inferior al del modelo base; las conversaciones largas requeriran truncado o resumen.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.
- Fine-tune de nicho con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa, sin benchmarks y con un unico mantenedor, lo que implica riesgo de abandono.
- La build depende de una libreria WASM concreta alojada en un repositorio de GitHub de MLC; un cambio de version puede romper la integracion.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene revisar las condiciones del modelo base y las de cualquier dato de entrenamiento no documentado.
- El rendimiento en produccion depende del navegador y del hardware del cliente, fuera del control del desarrollador; no hay SLA posible.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, es previsible que arrastre sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XxNoelW/Agora-1.0
- Pesos en precision completa: https://huggingface.co/XxNoelW/Agora-1.0-hf
- Proyecto Agora: https://xxnoelw.github.io/agora.bot/
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Librerias WASM de MLC LLM: https://github.com/mlc-ai/binary-mlc-llm-libs
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
