# trpeder/borealis-open-270m-ONNX

## Resumen

borealis-open-270m-ONNX es la conversion a formato ONNX del modelo NbAiLab/borealis-open-270m, publicada por el usuario trpeder para su uso con Transformers.js en el navegador. Se trata de un modelo de generacion de texto de tipo decoder-only, etiquetado con la arquitectura gemma3_text, lo que lo situa en la familia Gemma 3 de Google en su variante exclusivamente textual. Con 270 millones de parametros, es un modelo pequeno orientado a inferencia en dispositivo, no a razonamiento complejo.

El problema que resuelve esta publicacion concreta es la portabilidad: el repositorio ofrece los pesos ya convertidos a ONNX y cuantizados en dos variantes, onnx/model_q4.onnx (4 bits, pensada para WebAssembly) y onnx/model_q4f16.onnx (pesos de 4 bits con matematicas de 16 bits, pensada para WebGPU). Esto permite ejecutar el modelo integramente en el navegador dentro del proyecto GlirOS Helper, sin depender de servidores de inferencia.

La relevancia actual viene de su tamano reducido y su licencia Gemma: es un candidato razonable para asistentes embebidos, demostraciones educativas y aplicaciones de privacidad estricta donde los datos no deben salir del cliente. Los idiomas declarados son noruego (no), bokmal (nb), nynorsk (nn) e ingles (en), lo que refleja su origen como ajuste del National Library of Norway (NbAiLab). No se han publicado resultados de benchmarks ni detalles de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta gemma3_text, familia Gemma 3, variante solo texto) |
| Parametros totales | 270 millones (segun denominacion del modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4 (4 bits, WebAssembly) y q4f16 (pesos 4 bits, matematicas 16 bits, WebGPU) |
| Idiomas soportados | Noruego (no), bokmal (nb), nynorsk (nn), ingles (en) |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | ONNX (model_q4.onnx y model_q4f16.onnx) |
| Tamano del repositorio | 0,7 GB |
| Libreria declarada | transformers.js |
| Tarea (pipeline) | text-generation (conversacional) |
| Modelo base | NbAiLab/borealis-open-270m |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta gemma3_text, que identifica un transformer decoder-only de la familia Gemma 3 en su variante exclusivamente de texto. No hay detalles publicados en esta ficha sobre numero de capas, dimensiones ocultas, mecanismo de atencion, tipo de activacion ni estrategia de tokenizacion. Tampoco se documenta el uso de arquitecturas alternativas como MoE, SSM o hibridas, ni innovaciones del tipo decodificacion especulativa o atencion lineal.

Respecto al entrenamiento, la model card de esta publicacion no aporta informacion: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Lo unico verificable es que trpeder no ha reentrenado el modelo: la propia model card afirma que "the weights are otherwise unchanged" (los pesos no han sido modificados) y que se aplican los terminos y restricciones de uso de la model card original. Por tanto, cualquier detalle de entrenamiento debe consultarse en NbAiLab/borealis-open-270m, no en este repositorio. El trabajo tecnico realizado aqui es exclusivamente de conversion de formato y cuantizacion a ONNX en dos variantes optimizadas para WebAssembly y WebGPU respectivamente.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional, segun la etiqueta de pipeline text-generation y la categoria conversational declarada.
- Capacidades multilingues limitadas a noruego (con sus variantes bokmal y nynorsk) e ingles.
- Inferencia en navegador mediante Transformers.js, con dos rutas de ejecucion: WebAssembly (q4) y WebGPU (q4f16).
- Capacidades de razonamiento, matematicas y generacion de codigo: no documentadas en la informacion disponible.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles; la etiqueta gemma3_text indica una variante exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistentes embebidos en el navegador: el modelo se integra con Transformers.js y ejecuta la inferencia en el cliente mediante WebAssembly o WebGPU, de forma que la conversacion no abandona el dispositivo del usuario. Es adecuado por su tamano de 270 millones de parametros y su empaquetado ONNX ya cuantizado.
- Procesamiento de texto en noruego: traduccion asistida, resumen o reformulacion entre bokmal y nynorsk, aprovechando que estos son idiomas declarados del modelo y no un subproducto del entrenamiento en ingles.
- Demostraciones y prototipos sin infraestructura de servidor: al no requerir GPU dedicada ni endpoint de inferencia, sirve para validar productos de chat en fases tempranas con coste cero de backend.
- Aplicaciones con requisitos estrictos de privacidad: sectores como sanidad, legal o administracion publica donde enviar texto a una API externa no es aceptable; la ejecucion local resuelve el requisito de residencia del dato.
- Autocompletado y generacion de texto corto en formularios: por su tamano reducido puede ofrecer sugerencias de baja latencia dentro de una interfaz web, siempre que se mida el rendimiento real en el hardware objetivo.
- Educacion y experimentacion: el modelo sirve para que desarrolladores e investigadores estudien el flujo completo de conversion a ONNX, cuantizacion q4/q4f16 y despliegue con Transformers.js, incluida la comparacion entre la ruta WASM y la ruta WebGPU.
- Filtrado o clasificacion ligera de texto en el cliente: como primer nivel de triaje antes de delegar en un modelo mayor en servidor, reduciendo el volumen de peticiones externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros declarado (270 millones) y de los formatos de cuantizacion del repositorio; no proceden de mediciones publicadas por el autor.

- VRAM/RAM para q4 (4 bits): aproximadamente 135-200 MB solo para los pesos, mas el overhead del runtime ONNX y del buffer de contexto. En la practica, entre 400 MB y 1 GB de memoria del proceso del navegador.
- VRAM/RAM para q4f16 (pesos 4 bits, matematicas fp16): pesos en el mismo orden (135-200 MB), con un consumo adicional por activaciones en fp16. Se recomienda al menos 1 GB de memoria disponible para WebGPU.
- Referencia sin cuantizar: en fp16 el modelo ocuparia alrededor de 540 MB y en fp32 alrededor de 1,1 GB, muy por encima de lo que ofrece el repositorio.
- GPU compatibles: cualquier GPU integrada o dedicada moderna con soporte de WebGPU para la variante q4f16. Para la variante q4 basta CPU con WebAssembly, aunque el rendimiento sera inferior.
- GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o RTX 4090, e incluso en graficos integrados. El modelo no necesita A100 ni H100 en ningun escenario, salvo por agregacion de muchas instancias concurrentes.
- Opciones de despliegue: Transformers.js (libreria declarada por el autor), ONNX Runtime Web con backend WASM o WebGPU, y ONNX Runtime en servidor. vLLM y TGI no soportan ONNX de forma nativa; para llama.cpp, Ollama o LM Studio habria que reconvertir los pesos a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada y deben medirse en el hardware y navegador objetivo, ya que la variabilidad de WebGPU entre navegadores es alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| trpeder/borealis-open-270m-ONNX | 270 M | No disponible | Gemma | ONNX (q4, q4f16) | Conversion a ONNX para Transformers.js; pesos sin modificar |
| NbAiLab/borealis-open-270m | 270 M | No disponible | Gemma | Safetensors/PyTorch (no confirmado en esta busqueda) | Modelo original del que deriva esta conversion |
| trpeder/borealis-open-1b-ONNX | 1 B (segun denominacion) | No disponible | Gemma | ONNX (q4, q4f16) | Mismo autor y mismo flujo de conversion, en la variante de 1.000 millones de parametros |
| Modelos ONNX de la misma categoria (por ejemplo, alternativas de menos de 500 M en el ecosistema ONNX) | No disponible | No disponible | No disponible | ONNX | No se dispone de datos verificados en la informacion proporcionada |

Los datos de contexto, licencia y rendimiento de las alternativas no estan disponibles en la informacion proporcionada y deberian verificarse en sus respectivas model cards antes de tomar una decision. No se han publicado cifras de benchmarks que permitan una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Riesgo de alucinacion: con 270 millones de parametros, la capacidad de mantener coherencia factual es limitada; es previsible que invente datos en tareas de conocimiento abierto. No hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idiomas: solo se declaran noruego (no, nb, nn) e ingles. El rendimiento en castellano no esta soportado ni evaluado y previsiblemente sera deficiente.
- Contexto: se desconoce la longitud de contexto del modelo en la informacion disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Perdida por cuantizacion: las variantes q4 y q4f16 degradan la precision respecto al modelo original. La model card no incluye comparativas de calidad entre los pesos originales y los cuantizados.
- Capacidades no documentadas: no hay evidencia de soporte de tool calling, agentes, vision, audio o modo de razonamiento. No deben asumirse en produccion sin pruebas propias.
- Restricciones de licencia: el modelo se distribuye bajo la licencia Gemma y esta sujeto a los Gemma Terms of Use (ai.google.dev/gemma/terms) y a la Gemma Prohibited Use Policy (ai.google.dev/gemma/prohibited_use_policy). Es imprescindible revisar ambas antes de cualquier uso comercial.
- Herencia de terminos: la model card establece explicitamente que se aplican los terminos y restricciones de uso de la model card original de NbAiLab/borealis-open-270m. La licencia de esta conversion no puede ser mas permisiva que la del modelo base.
- Madurez del repositorio: registra cero descargas y cero "likes" en el momento de la consulta, y fue publicado y actualizado el mismo dia, lo que indica un artefacto reciente y sin validacion de la comunidad.
- Entorno de ejecucion: al depender de WebAssembly y WebGPU, el rendimiento y la estabilidad variaran notablemente entre navegadores, versiones y sistemas operativos. Es necesario validar en los navegadores objetivo.
- Sin garantias de mantenimiento: no hay informacion sobre si el autor actualizara la conversion ante cambios en el modelo base o en Transformers.js.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trpeder/borealis-open-270m-ONNX
- Modelo base: https://huggingface.co/NbAiLab/borealis-open-270m
- Variante de 1B del mismo autor: https://huggingface.co/trpeder/borealis-open-1b-ONNX
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Busqueda de modelos de la familia borealis-open-270m en HuggingFace: https://huggingface.co/models?search=NbAiLab%2Fborealis-open-270m
- ONNX Model Zoo (repositorio de modelos ONNX): https://github.com/onnx/models
- Modelos disponibles en ONNX Runtime: https://onnxruntime.ai/models
