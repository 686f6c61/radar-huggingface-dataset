# SpacemiT/FastVLM-0.5B

## Resumen

FastVLM-0.5B es una conversión de despliegue para entornos edge del modelo vision-language homónimo desarrollado por Apple, adaptada por SpacemiT para sus procesadores RISC-V K1 y K3. El modelo original fue presentado en CVPR 2025 y destaca por su encoder de visión FastViTHD, que genera menos tokens visuales y reduce la latencia de codificación manteniendo una calidad de comprensión de imagen competitiva. Esta versión específica combina un encoder de visión exportado a ONNX (ejecutado mediante el SpacemiT Execution Provider) con un decoder de texto basado en Qwen2-0.5B almacenado en formato GGUF con cuantización Q4_1, y se sirve a través de una API compatible con OpenAI mediante `llama-server`.

El modelo tiene 630 millones de parámetros en total y está pensado para ejecutarse íntegramente en CPU RISC-V con aceleración específica de los núcleos SMT de las placas K1 y K3. Su relevancia radica en ofrecer capacidades de visión por computador en dispositivos de bajo consumo sin depender de GPU, algo especialmente útil en aplicaciones industriales, robótica y asistentes embebidos. No es un modelo nuevo entrenado por SpacemiT, sino una adaptación de despliegue del modelo de Apple, que mantiene la licencia `apple-amlr`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastViTHD (encoder de vision) + Qwen2-0.5B (decoder de texto) |
| Parametros totales | 630.167.424 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (decoder de texto), FP16 (encoder de vision en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr |
| Formato de pesos | GGUF (texto) y ONNX (vision) |

## Arquitectura y entrenamiento

El modelo original de Apple combina un encoder de visión FastViTHD con un LLM Qwen2 de 0.5B como decoder de texto. FastViTHD es una variante eficiente del vision transformer que reduce el número de tokens visuales generados por imagen, lo que disminuye el coste computacional tanto en la codificación como en la atención posterior del LLM. Según el paper, esta arquitectura consigue un equilibrio optimizado entre resolución de entrada, latencia y precisión. El entrenamiento siguió el esquema LLaVA-1.5: primero un pretraining de alineación visión-texto y después un ajuste fino con instrucciones visuales.

La versión de SpacemiT no modifica los pesos del modelo, sino que los convierte para su ejecución en hardware RISC-V. El encoder de visión se exporta a ONNX con precisión FP16 y se ejecuta mediante el SpacemiT Execution Provider dentro de ONNX Runtime, mientras que el decoder de texto se cuantiza a Q4_1 y se sirve con un fork de `llama.cpp` que incluye soporte para los núcleos acelerados SMT de los chips K1/K3. No se ha realizado ningún entrenamiento adicional.

## Capacidades

- Comprension de imagenes y generacion de descripciones en lenguaje natural.
- Conversacion multimodal: el modelo acepta una imagen y texto de instruccion, y responde con texto.
- Integracion con API compatible con OpenAI a traves de `llama-server`, lo que facilita su uso desde aplicaciones existentes.
- Ejecucion completamente local en CPU RISC-V, sin necesidad de GPU ni conexion a la nube.
- Soporte para dos plataformas SpacemiT: K1 (4 nucleos acelerados) y K3 (8 nucleos acelerados), con configuraciones de afinidad especificas.
- No se menciona soporte de tool calling, funciones de agente, ni capacidades de audio o video.

## Casos de uso

- Inspeccion visual en fabricacion: el modelo puede analizar imagenes de productos en una linea de montaje y detectar defectos o anomalias, ejecutandose en placas K1/K3 integradas en maquinaria industrial sin depender de un servidor central.
- Asistentes de accesibilidad para personas con discapacidad visual: un dispositivo portatil con camara puede describir el entorno, leer textos o identificar objetos en tiempo real, gracias a la baja latencia del encoder FastViTHD.
- Robotica de servicio: robots autonomos que necesitan entender su entorno pueden usar el modelo para reconocer objetos, personas o senales, con la ventaja de ejecutarse en el propio robot sin conexion a internet.
- Vigilancia perimetral en entornos remotos: camaras inteligentes con placas SpacemiT pueden generar descripciones de eventos capturados y enviarlas como texto a un sistema central, reduciendo el ancho de banda necesario.
- Prototipado rapido de aplicaciones de vision: los desarrolladores pueden desplegar un servidor compatible con OpenAI en una placa K1/K3 y probar flujos de trabajo de image-to-text con herramientas estandar como curl o clientes OpenAI.
- Educacion y demostraciones de IA embebida: el modelo permite ensenar conceptos de vision por computador y modelos de lenguaje en hardware de bajo coste, sin necesidad de GPU ni servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion de SpacemiT en la informacion disponible. El paper original de FastVLM reporta que el variante de 0.5B supera a LLaVA-OneVision-0.5B con un tiempo hasta el primer token 85 veces menor y un encoder de vision 3.4 veces mas pequeno, pero esos datos corresponden al modelo de Apple en hardware de referencia, no a esta adaptacion RISC-V. No se dispone de mediciones de latencia o throughput para las placas K1/K3 en la documentacion proporcionada.

## Requisitos de hardware

- Placas SpacemiT K1 (4 nucleos acelerados SMT) o K3 (8 nucleos acelerados SMT), ambas con arquitectura RISC-V de 64 bits.
- Se requieren dos componentes de software: un paquete de ONNX Runtime con el SpacemiT Execution Provider (version 2.0.6 validada) y una compilacion de `llama.cpp` con soporte SMT que incluya `llama-server`.
- No se necesita GPU ni memoria VRAM; la inferencia se ejecuta completamente en CPU.
- Para K1, se usan los nucleos 0-3 con 4 hilos; para K3, los nucleos 8-15 con 8 hilos.
- El despliegue se realiza copiando el directorio del modelo, el paquete ORT y la instalacion de `llama.cpp` a la placa, y configurando las variables de entorno `LD_LIBRARY_PATH` y `MODEL_DIR`.
- El servidor se lanza con `llama-server` usando los argumentos `--media-backend smt`, `--smt-config-dir` y `-t` para el numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SpacemiT/FastVLM-0.5B | 630 M | no disponible | apple-amlr | GGUF + ONNX | Adaptacion edge para RISC-V |
| apple/FastVLM-0.5B (original) | 630 M | no disponible | apple-amlr | safetensors | Modelo base de Apple, para Apple Silicon |
| LLaVA-OneVision-0.5B | ~0.5B | no disponible | Apache 2.0 (aprox.) | safetensors | Alternativa de referencia, menos eficiente en vision segun el paper |

La comparativa se basa en los datos publicados en el paper de FastVLM y en las fichas de HuggingFace. No se dispone de informacion detallada sobre contexto o idiomas para ninguno de los modelos.

## Limitaciones y advertencias

- La licencia `apple-amlr` (Apple AML Research License) impone restricciones de uso; es necesario revisar sus terminos antes de cualquier despliegue comercial.
- Esta version esta optimizada exclusivamente para las plataformas SpacemiT K1/K3; no funcionara en otros hardware sin modificaciones sustanciales.
- La cuantizacion Q4_1 del decoder de texto puede degradar la calidad de generacion en comparacion con el modelo original en FP16, especialmente en tareas que requieren razonamiento fino.
- No se ha publicado informacion sobre la longitud de contexto soportada ni sobre los idiomas cubiertos; se recomienda validar estos aspectos antes de usarlo en produccion.
- El modelo depende de un fork especifico de `llama.cpp` y de una version concreta de ONNX Runtime con el SpacemiT Execution Provider; las versiones futuras pueden no ser compatibles.
- No se han proporcionado datos de sesgos, alucinaciones o comportamiento en escenarios adversos; como modelo de 0.5B, su capacidad de razonamiento es limitada y puede producir respuestas incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpacemiT/FastVLM-0.5B
- Modelo original de Apple: https://huggingface.co/apple/FastVLM-0.5B
- Version FP16 del modelo original: https://huggingface.co/apple/FastVLM-0.5B-fp16
- Paper de FastVLM: https://arxiv.org/abs/2412.13303
- Repositorio oficial de Apple: https://github.com/apple/ml-fastvlm
- Repositorio de ONNX Runtime de SpacemiT: https://github.com/spacemit-com/onnxruntime/releases
- Repositorio de llama.cpp de SpacemiT: https://github.com/spacemit-com/llama.cpp
- Pagina de investigacion de Apple: https://machinelearning.apple.com/research/fastvlm-efficient-vision-encoding
