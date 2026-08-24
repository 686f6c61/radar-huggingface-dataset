# vitorcalvi/qwen2.5-1.5b-mnn-cpu

## Resumen

El repositorio `vitorcalvi/qwen2.5-1.5b-mnn-cpu` contiene una conversión del modelo [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) al formato MNN (Mobile Neural Network), desarrollado por Alibaba. El objetivo es permitir la inferencia del modelo en CPU de dispositivos locales (móviles, edge, etc.) mediante el runtime LLM de MNN, sin necesidad de GPU. Se trata de un artefacto cuantizado a 4 bits, no del checkpoint original de PyTorch/Hugging Face.

La relevancia de esta conversión radica en que Qwen2.5-1.5B-Instruct es un modelo denso de 1.500 millones de parámetros, preentrenado con hasta 18 billones de tokens, con soporte multilingüe y una ventana de contexto de hasta 128K tokens. Al convertirlo a MNN con cuantización 4-bit, se reduce el tamaño a aproximadamente 0,8 GB, lo que lo hace viable para ejecutarse en dispositivos con recursos limitados. El repositorio incluye los archivos necesarios (`llm.mnn`, `llm.mnn.weight`, `config.json`, etc.) para que el runtime MNN cargue y ejecute el modelo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificado en la conversion; el modelo base soporta hasta 128K tokens |
| Tipos de cuantizacion | 4 bits (blockSize=128, lmHeadBits=4) |
| Idiomas soportados | no especificado en la conversion; el modelo base Qwen2.5 es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`llm.mnn` + `llm.mnn.weight`) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención completa, preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens. La variante Instruct incorpora ajuste fino supervisado y optimización por preferencias humanas (RLHF/DPO) para mejorar la capacidad de seguir instrucciones y dialogar. Esta conversión concreta no introduce cambios en la arquitectura; simplemente transforma los pesos del checkpoint original al formato MNN y los cuantiza a 4 bits con un tamaño de bloque de 128 y 4 bits adicionales para la cabeza de lenguaje (`lmHeadBits=4`). El proceso de conversión se realizó con la herramienta MNN, fijada en el commit `6d1549aa9`, y no se ha vuelto a entrenar el modelo.

## Capacidades

- Generacion de texto y dialogo conversacional, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico, matematicas y generacion de codigo, aunque con limitaciones propias de un modelo de 1,5B.
- Soporte multilingue (el modelo base cubre decenas de idiomas, aunque la conversion no especifica una lista).
- Capacidad de tool calling y function calling en el modelo base; la conversion MNN puede heredarla si el runtime lo soporta.
- No se ha verificado en esta conversion si el modo de razonamiento extendido (thinking) esta disponible; el modelo base no lo incluye de forma nativa.

## Casos de uso

- Asistentes virtuales en dispositivos moviles: el modelo puede ejecutarse localmente en un telefono o tablet para responder preguntas y mantener conversaciones sin conexion, gracias a su tamano reducido (0,8 GB) y a que solo requiere CPU.
- Chatbots de atencion al cliente embebidos: integrable en aplicaciones de escritorio o kioscos interactivos donde no se dispone de GPU, ofreciendo respuestas contextuales con baja latencia.
- Procesamiento de texto en entornos con privacidad estricta: al ejecutarse en el dispositivo, los datos no salen del equipo, lo que resulta adecuado para sectores como salud o banca.
- Generacion de borradores de documentos o correos: util para herramientas de productividad que necesitan asistencia de redaccion sin depender de servicios en la nube.
- Educacion y aprendizaje de idiomas: puede servir como tutor conversacional en aplicaciones educativas, aprovechando su capacidad multilingue.
- Prototipado rapido de aplicaciones de IA generativa: al ser un artefacto MNN listo para usar, permite integrar un LLM en aplicaciones moviles o de escritorio con un esfuerzo minimo de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion MNN en la informacion disponible. El modelo base Qwen2.5-1.5B-Instruct tiene resultados publicados en el informe tecnico de Qwen2.5 (arXiv:2412.15115), pero no se dispone de mediciones de rendimiento (latencia, throughput) para esta version cuantizada en CPU. Se recomienda realizar pruebas propias con el runtime MNN en el hardware objetivo.

## Requisitos de hardware

- No requiere GPU; esta disenado para inferencia en CPU.
- Tamano del repositorio: 0,8 GB, por lo que se estima un consumo de RAM de aproximadamente 1 GB durante la inferencia (pesos + overhead del runtime).
- Puede ejecutarse en dispositivos moviles con al menos 1 GB de RAM libre y arquitectura ARM64 o x86_64.
- En ordenadores de escritorio o portatiles, cualquier CPU moderna con 2 GB de RAM es suficiente.
- Despliegue mediante el runtime LLM de MNN (repositorio oficial de Alibaba MNN). No es compatible directamente con vLLM, llama.cpp u Ollama, ya que el formato es especifico de MNN.
- La latencia dependera del hardware; en una CPU de gama media se esperan decenas de tokens por segundo, aunque no se dispone de cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (original) | 1,5B | 128K | FP16/BF16 | PyTorch | Apache-2.0 |
| Qwen2.5-1.5B-Instruct (GGUF Q4_K_M) | 1,5B | 128K | 4-bit | GGUF | Apache-2.0 |
| vitorcalvi/qwen2.5-1.5b-mnn-cpu | 1,5B | no especificado | 4-bit | MNN | Apache-2.0 |

La principal diferencia frente a las alternativas es el formato: MNN esta optimizado para dispositivos moviles y edge, mientras que GGUF se usa con llama.cpp/Ollama y PyTorch para entornos con GPU. No se dispone de datos comparativos de rendimiento entre estas versiones.

## Limitaciones y advertencias

- No es el checkpoint original de Hugging Face; es un artefacto MNN cuantizado. Cualquier herramienta que espere pesos en formato PyTorch o safetensors no podra cargarlo directamente.
- La cuantizacion a 4 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo en precision completa.
- No se ha verificado que la ventana de contexto de 128K del modelo base se mantenga integra en esta conversion; es posible que el runtime MNN imponga un limite menor.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en tareas de razonamiento complejo o informacion factual, dado su tamano reducido.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de MNN para confirmar el cumplimiento.
- No se han publicado benchmarks de rendimiento para esta conversion, por lo que el comportamiento en produccion debe validarse experimentalmente.

## Enlaces

- Repositorio HuggingFace: [vitorcalvi/qwen2.5-1.5b-mnn-cpu](https://huggingface.co/vitorcalvi/qwen2.5-1.5b-mnn-cpu)
- Modelo base: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- Repositorio MNN: [alibaba/MNN](https://github.com/alibaba/MNN)
- Informe tecnico Qwen2.5: [arXiv:2412.15115](https://arxiv.org/pdf/2412.15115v2)
- Pagina de Qwen2.5 en Ollama (referencia del modelo base): [ollama.com/library/qwen2.5:1.5b](https://ollama.com/library/qwen2.5:1.5b)
