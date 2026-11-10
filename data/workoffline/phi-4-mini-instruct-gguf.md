# WorkOffline/Phi-4-mini-instruct-GGUF

## Resumen
Phi-4-mini-instruct-GGUF es un espejo (mirror) del modelo Phi-4-mini-instruct de Microsoft, publicado por el usuario WorkOffline en formato GGUF. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explícitamente que los bytes de los ficheros son idénticos a los del repositorio original de conversión de Unsloth (`unsloth/Phi-4-mini-instruct-GGUF`), y que el único propósito del repositorio es servir como punto de descarga único, fijado a una revisión concreta y verificado mediante SHA-256, para la aplicación WorkOffline.

El modelo subyacente, Phi-4-mini-instruct, es un transformer decoder-only denso de aproximadamente 3.836 millones de parámetros (3,8B), desarrollado por Microsoft Research dentro de la familia Phi-4. Está diseñado para instrucciones y conversación, con un contexto declarado por Microsoft de 128.000 tokens (dato de la model card original; no se repite en la información de este espejo). Su relevancia radica en ofrecer un modelo pequeño, con licencia MIT y capacidades de razonamiento y código, desplegable en hardware de consumo.

Este repositorio concreto contiene únicamente una cuantización Q4_K_M en GGUF de 2.491.874.272 bytes (unos 2,5 GB), lo que lo hace adecuado para inferencia local en CPU o GPU modesta mediante llama.cpp u Ollama. No se han publicado descargas ni interacciones en el momento de la consulta, y el repositorio no incluye pipeline declarado ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 (3,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en este repositorio (el modelo base declara 128.000 tokens segun Microsoft; no verificado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en este espejo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `Phi-4-mini-instruct-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base Phi-4-mini-instruct de Microsoft, un transformer decoder-only denso de 3,8B parámetros. Este repositorio no aporta información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF, DPO o similares; esos detalles deben consultarse en la model card original de Microsoft, que no forma parte de la información proporcionada.

La única intervención técnica documentada aquí es la conversión a GGUF realizada por Unsloth y la posterior copia byte a byte en este repositorio. El autor indica que los ficheros son idénticos a los de origen y que solo puede variar el nombre del fichero; se incluye una tabla con el SHA-256 (`88c00229914083cd112853aab84ed51b87bdf6b9ce42f532d8c85c7c63b1730a`) para verificación de integridad.

## Capacidades
- Generación de texto conversacional e instrucciones: el modelo base está etiquetado como `conversational` y `instruct`.
- Razonamiento y matemáticas: capacidades propias de la familia Phi-4-mini-instruct (no detalladas en este repositorio).
- Generación de código: atribuible al modelo base; no se documentan métricas en este espejo.
- Soporte de tool calling / function calling: no disponible en la información de este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información de este repositorio.
- Capacidades multilingües: no disponible (el repositorio no declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información de este repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso a través de infraestructura de inferencia compatible, sin más detalle.

## Casos de uso
- Inferencia local en estaciones de trabajo sin GPU dedicada: con 2,5 GB en Q4_K_M, el modelo puede ejecutarse en CPU mediante llama.cpp, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Integración en la aplicación WorkOffline: el repositorio existe precisamente para que esa aplicación descargue el fichero desde un punto fijo y verifique su SHA-256, garantizando reproducibilidad de la versión del modelo.
- Despliegue en GPU de consumo: la cuantización Q4_K_M permite cargar el modelo completo en GPUs con 4-6 GB de VRAM, habilitando chat e instrucciones en tiempo real en equipos tipo RTX 3060 o superiores.
- Entornos con requisitos de licencia permisiva: la licencia MIT facilita la incorporación del modelo en productos comerciales y en pipelines internos sin obligaciones de atribución copyleft.
- Evaluación y benchmarking de modelos pequeños: al ser una copia verificable, sirve como referencia estable para comparar el rendimiento de Phi-4-mini frente a otros modelos de menos de 4B en tareas de razonamiento e instrucciones.
- Generación de código asistida en local: el modelo base está orientado a instrucciones y código, por lo que puede integrarse en editores o scripts de automatización que requieran un asistente sin conexión.
- Reproducibilidad en investigación: el pinning a una revisión concreta y el hash SHA-256 permiten replicar experimentos con exactitud sobre los mismos pesos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2,5-3,5 GB para el fichero Q4_K_M, más overhead de contexto KV cache; en la práctica, unos 4 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; cualquier GPU con al menos 4-6 GB de VRAM puede alojar el modelo.
- GPU de consumo: sí, cabe en GPUs consumer con 6 GB o más; también puede ejecutarse íntegramente en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; también es posible servirlo mediante servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en su flujo estándar, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct (este espejo, Q4_K_M) | 3,8B | no disponible aquí (128k según Microsoft) | MIT | GGUF | Copia verificada de Unsloth; sin benchmarks en este repo |
| Microsoft Phi-3.5-mini-instruct | 3,8B | no disponible | MIT | safetensors, GGUF (vía terceros) | Generación anterior de la familia Phi; comparación directa por tamaño |
| Qwen2.5-3B-Instruct | 3,1B | no disponible | Apache 2.0 | safetensors, GGUF (vía terceros) | Alternativa de tamaño similar con licencia permisiva |
| Llama-3.2-3B-Instruct | 3,2B | no disponible | Llama 3.2 Community License | safetensors, GGUF (vía terceros) | Restricciones de licencia distintas a MIT |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la tabla recoge únicamente parámetros, licencia y disponibilidad de formato.

## Limitaciones y advertencias
- Este repositorio no es un modelo original: es una copia de los ficheros GGUF de Unsloth, por lo que cualquier limitación del modelo base aplica íntegramente.
- No se documentan sesgos conocidos en la información disponible; deben consultarse en la model card de Microsoft.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se aportan evaluaciones específicas en este repositorio.
- Limitaciones de contexto e idioma: no disponibles en este repositorio; la lista de idiomas no está declarada.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar los ficheros `LICENSE` y `NOTICE.md` incluidos, copiados del repositorio original de Microsoft.
- Solo se incluye la cuantización Q4_K_M; no hay otras cuantizaciones (Q5, Q8, F16) en este espejo, lo que limita la elección de precisión.
- El repositorio no declara pipeline ni idiomas, y no registra descargas ni interacciones, por lo que su adopción y mantenimiento no están contrastados.
- Para producción a gran escala con vLLM o TGI sería preferible usar los pesos originales en safetensors de Microsoft, no este GGUF.

## Enlaces
- Repositorio de este espejo: https://huggingface.co/WorkOffline/Phi-4-mini-instruct-GGUF
- Modelo base original: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Conversión GGUF de origen: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Licencia MIT del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE
- NOTICE del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/cfbefacb99257ffa30c83adab238a50856ac3083/NOTICE.md
