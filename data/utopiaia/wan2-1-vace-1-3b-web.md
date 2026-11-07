# UtopiaIA/Wan2.1-VACE-1.3B-web

## Resumen

Wan2.1-VACE-1.3B-web es una conversión a ONNX del módulo VACE del modelo Wan 2.1 VACE 1.3B de Wan-AI, integrado en el transformer de pocos pasos rCM de Wan 2.1 T2V 1.3B y empaquetado para ejecutarse en el navegador mediante ONNX Runtime Web sobre WebGPU. El modelo está pensado para generar vídeo entre fotogramas clave (primer y último fotograma, o los últimos fotogramas del clip anterior), una tarea de image-to-video con control temporal. Lo publica el usuario UtopiaIA y lo utiliza el producto Elffuss.

La particularidad de este repositorio es que no contiene el modelo completo: al compartir los 30 bloques base de VACE con los del transformer de Wan 2.1 T2V 1.3B, aquí solo se incluyen los pesos específicos de VACE (los 15 bloques VACE y el encoder lighttaew2_1), mientras que los pesos del transformer, el codificador de texto y el decodificador se leen del repositorio UtopiaIA/Wan2.1-T2V-1.3B-web. El sampler es el de rCM, de 4 pasos y sin guidance.

El interés actual reside en que permite ejecutar generación de vídeo con control por fotogramas clave directamente en el navegador, sin backend GPU dedicado, gracias a la cuantización de las capas lineales de VACE a 8 bits (MatMulNBits) y al uso de WebGPU. Los nuevos bytes que aporta el repositorio son 813 MB sobre un total de 0,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Wan 2.1) con bloques VACE y sampler rCM de pocos pasos; grafo ONNX |
| Parametros totales | 1,3B (modelo base Wan 2.1 VACE 1.3B); este repositorio solo incluye los pesos VACE |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de las capas lineales de VACE en 8 bits (MatMulNBits); resto segun repositorio T2V asociado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`) para ONNX Runtime Web / WebGPU |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de difusion de Wan 2.1 en su variante VACE 1.3B, que incorpora un modulo VACE de 15 bloques para el control de vídeo por condiciones (fotogramas clave). Estos bloques se entretejen en el transformer de Wan 2.1 T2V 1.3B, cuyos 30 bloques base son compartidos con VACE. El sampler utilizado es el de rCM (worstcoder/rcm-Wan), que reduce la generacion a 4 pasos sin guidance, lo que hace viable la inferencia interactiva en el navegador.

La conversion a ONNX separa el grafo de prompt (`dit/vctx.onnx`, que produce las claves y valores de cross-attention de los bloques VACE) y el transformer en tres ejecuciones (`dit/vpart0…2.onnx`), cada una de las cuales lee los datos del repositorio T2V. El encoder `vae/lighttaew2_1_encoder.onnx` procesa 4 fotogramas a la vez con sus memorias para convertir los fotogramas conocidos en latentes. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de video image-to-video con control por fotogramas clave (primer y ultimo fotograma, o continuacion desde los ultimos fotogramas de un clip).
- Generacion de video en 4 pasos de muestreo sin guidance (sampler rCM).
- Ejecucion en navegador mediante ONNX Runtime Web sobre WebGPU.
- Integracion con el pipeline de Wan 2.1 T2V 1.3B para texto, transformer y decodificacion.
- Codificacion de fotogramas conocidos a latentes mediante el encoder lighttaew2_1 (4 fotogramas por paso con memorias).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o thinking mode: no disponible.

## Casos de uso

- Interpolacion y control entre fotogramas clave en el navegador: el modelo genera el video intermedio entre un primer y un ultimo fotograma dados, lo que permite crear transiciones controladas sin salir del navegador gracias a WebGPU y a los 4 pasos del sampler rCM.
- Continuacion de clips existentes: tomando los ultimos fotogramas de un clip previo como condicion, el modelo extiende la secuencia, util para montajes iterativos en herramientas web.
- Prototipado rapido de animaciones en estudios pequenos: al ejecutarse localmente en el navegador, permite a disenadores probar variaciones de keyframes sin infraestructura de GPU en servidor.
- Herramientas de creacion de contenido integradas en web (como Elffuss): el modelo puede incrustarse en editores online para generar video a partir de fotogramas clave aportados por el usuario.
- Demos educativas y de investigacion sobre difusion de video: al ser ONNX y Apache-2.0, sirve para estudiar el comportamiento de VACE y rCM en entornos sin backend.
- Generacion de video en dispositivos con GPU consumer: al estar cuantizado a 8 bits y requerir solo 813 MB adicionales, es viable en equipos con WebGPU compatible, reduciendo costes de infraestructura.
- Pruebas de concepto de pipelines image-to-video en produccion web: permite validar la experiencia de usuario y la latencia antes de migrar a un backend con el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio aporta 813 MB de pesos nuevos, pero el modelo completo requiere ademas los pesos del transformer, codificador de texto y decodificador del repositorio UtopiaIA/Wan2.1-T2V-1.3B-web.
- GPU recomendadas: no disponible; el requisito funcional es un navegador con soporte de WebGPU.
- GPU consumer: el diseno apunta a ejecucion en navegador sobre WebGPU, lo que incluye GPU de consumo compatibles, aunque no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (libreria declarada `onnxruntime-web`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UtopiaIA/Wan2.1-VACE-1.3B-web | 1,3B (solo pesos VACE, 813 MB) | no disponible | ONNX para navegador | Apache-2.0 | Hugging Face, ejecucion en navegador |
| Wan-AI/Wan2.1-VACE-1.3B | 1,3B (2B segun la model card del autor) | no disponible | no disponible | no disponible | Hugging Face |
| worstcoder/rcm-Wan | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| UtopiaIA/Wan2.1-T2V-1.3B-web | no disponible | no disponible | ONNX para navegador | no disponible | Hugging Face |

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: necesita los pesos y grafos de UtopiaIA/Wan2.1-T2V-1.3B-web (transformer, codificador de texto y decodificador) para funcionar.
- Debido a la cuantizacion de los pesos, una misma semilla no reproduce el video del modelo original, por lo que la reproducibilidad exacta no esta garantizada.
- La ejecucion depende de WebGPU y de ONNX Runtime Web; navegadores o dispositivos sin soporte no podran ejecutarlo.
- No hay informacion sobre sesgos, riesgo de alucinacion visual, idiomas soportados ni limitaciones de contexto en la informacion disponible.
- Aunque la licencia es Apache-2.0, se debe consultar el archivo NOTICE para las fuentes y autores originales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion.
- No se han publicado benchmarks ni datos de latencia o throughput que permitan evaluar su calidad frente al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/UtopiaIA/Wan2.1-VACE-1.3B-web
- Modelo base Wan-AI/Wan2.1-VACE-1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Repositorio de archivos del modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B/tree/main
- rCM Wan (worstcoder/rcm-Wan): https://huggingface.co/worstcoder/rcm-Wan
- Repositorio T2V asociado: https://huggingface.co/UtopiaIA/Wan2.1-T2V-1.3B-web
- Elffuss: https://elffuss.com/
