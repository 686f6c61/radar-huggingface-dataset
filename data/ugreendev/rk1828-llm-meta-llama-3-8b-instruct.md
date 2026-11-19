# UGREENDEV/RK1828-LLM-Meta-Llama-3-8B-Instruct

## Resumen

RK1828-LLM-Meta-Llama-3-8B-Instruct es un artefacto de despliegue publicado por UGREENDEV que contiene el modelo Meta Llama 3 8B Instruct convertido al formato RKNN para su ejecucion sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una conversion de pesos del checkpoint original `LLM-Research/Meta-Llama-3-8B-Instruct` a un grafo cuantizado w4a16 (pesos de 4 bits, activaciones de 16 bits) ejecutable con la RKNN Runtime v1.1.0 sobre ocho nucleos NPU del SoC RK1828.

El problema que resuelve es la brecha entre los modelos Llama 3 y el hardware de borde basado en NPU Rockchip: el repositorio entrega los ficheros ya compilados, checksums SHA-256 y un directorio de configuracion (`Meta-Llama-3-8B-Instruct-w4a16-8-4096`) listo para desplegar en dispositivos con ese chip. La ventana de contexto queda fijada en 4096 tokens con KVCache en fp16, coherente con las restricciones de memoria de un acelerador de borde.

Su relevancia es practica y acotada: permite ejecutar un modelo de 8B parametros en local sobre hardware Rockchip sin pasar por el proceso de conversion, a costa de perder precision por la cuantizacion w4a16 y de quedar atado a una unica plataforma. El repositorio ocupa 5,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), convertido a grafo RKNN |
| Parametros totales | 8 mil millones (modelo base Llama 3 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (4k) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (Meta Llama 3 Community License Agreement para el modelo fuente) |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio con config.json, SHA256SUMS y directorio de configuracion |

## Arquitectura y entrenamiento

El modelo subyacente es Meta Llama 3 8B Instruct, un transformer decoder-only con atencion causal estandar, entrenado originalmente por Meta AI y posteriormente alineado mediante instrucciones. Sobre ese checkpoint, UGREENDEV aplica una conversion a formato RKNN con cuantizacion w4a16 y lo compila para ocho nucleos NPU del RK1828, con la KVCache mantenida en fp16. No se documentan en la informacion disponible los detalles del dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de Meta y no se reproducen aqui.

La innovacion tecnica del artefacto no esta en el modelo sino en el pipeline de despliegue: empaquetado por directorio de configuracion, verificacion de integridad mediante SHA-256 y compatibilidad declarada con una version concreta de RKNN Runtime y driver. La comprobacion de version en el dispositivo se realiza con `rknn-smi -v` antes de ejecutar. Cualquier desajuste entre runtime, driver y ficheros del directorio de configuracion invalida el despliegue.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del checkpoint Llama 3 8B Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat.
- Generacion de codigo y resolucion de tareas de matematicas simples, sujetas a la perdida de precision de la cuantizacion w4a16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta conversion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el artefacto es exclusivamente text-generation.
- Ejecucion en dispositivo de borde sobre NPU RK1828 con contexto maximo de 4096 tokens.

## Casos de uso

- Asistente conversacional embebido en dispositivos con SoC RK1828: el modelo puede mantener dialogos multi-turno dentro de la ventana de 4096 tokens, adecuada para interacciones de electrodomesticos, paneles de control o terminales de punto de venta.
- Procesamiento de lenguaje natural en local sin conexion: al ejecutarse sobre NPU integrada, permite clasificacion, resumen y extraccion de entidades en entornos sin conectividad o con requisitos de privacidad estrictos.
- Generacion de respuestas en asistentes de voz para hardware de consumo: la latencia depende del NPU, pero al no requerir llamadas a la nube se elimina el coste por token y la dependencia de red.
- Automatizacion de soporte tecnico en kioscos o terminales industriales: el modelo puede redactar respuestas a partir de contexto inyectado en el prompt, siempre que quepa en los 4096 tokens.
- Prototipado de aplicaciones de IA generativa sobre Rockchip: sirve como referencia para validar pipelines RKNN antes de invertir en modelos mayores o en fine-tunings propios.
- Educacion y demostraciones de inferencia en borde: util para comparar el comportamiento de Llama 3 8B en w4a16 frente al checkpoint original en fp16, midiendo la degradacion por cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni latencia o throughput medidos sobre el RK1828.

## Requisitos de hardware

- Plataforma obligatoria: SoC Rockchip RK1828 con ocho nucleos NPU; no se contempla ejecucion en GPU convencional con estos ficheros.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar con `rknn-smi -v` en el dispositivo.
- Memoria: el repositorio ocupa 5,6 GB; la huella en ejecucion depende de la cuantizacion w4a16 y de la KVCache fp16 para 4096 tokens, pero no se proporciona la cifra exacta de memoria residente.
- GPU recomendadas: no aplicable; el artefacto no esta pensado para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no; requiere el acelerador RK1828.
- Opciones de despliegue: RKNN Runtime sobre el dispositivo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Plataforma | Licencia |
|---|---|---|---|---|---|
| RK1828-LLM-Meta-Llama-3-8B-Instruct | 8B | 4096 | RKNN w4a16 | NPU RK1828 | other (Meta Llama 3 Community License) |
| Meta Llama 3 8B Instruct (original) | 8B | 8192 | safetensors fp16/bf16 | GPU / CPU | Meta Llama 3 Community License |
| Modelos GGUF de Llama 3 8B Instruct | 8B | 8192 | GGUF Q4_K_M y similares | CPU, GPU consumer via llama.cpp | Meta Llama 3 Community License |

La comparativa se limita al modelo fuente y a sus distribuciones GGUF, ya que no se dispone de informacion sobre otras conversiones RKNN comparables. Frente al checkpoint original, esta version reduce el contexto a la mitad y anade cuantizacion w4a16, a cambio de ejecutarse en NPU de borde.

## Limitaciones y advertencias

- Dependencia total del hardware RK1828: los ficheros no son portables a otras NPU, GPU o CPU.
- Contexto reducido a 4096 tokens, la mitad que el Llama 3 8B original (8192).
- Cuantizacion w4a16 que puede degradar la calidad en tareas de razonamiento, matematicas y generacion de codigo frente al checkpoint en fp16.
- Riesgo de alucinacion inherente al modelo base; no se documenta ningun mecanismo adicional de mitigacion en esta conversion.
- Sesgos conocidos del modelo Llama 3 8B Instruct, no reevaluados ni corregidos en el artefacto.
- Licencia "other": el uso esta sujeto a la Meta Llama 3 Community License Agreement, a los terminos de RKNN Toolkit y RKNN Runtime, y a las condiciones adicionales del fichero `Notice`. Es imprescindible revisar `LICENSE` y `USE_POLICY.md` antes de un uso comercial.
- Requiere verificar la integridad con `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas devuelven `OK`.
- No se declaran idiomas soportados; el comportamiento multilingue no esta garantizado por el autor de la conversion.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Meta-Llama-3-8B-Instruct
- Modelo fuente en ModelScope: https://modelscope.cn/models/LLM-Research/Meta-Llama-3-8B-Instruct
- Directorio de configuracion documentado: `Meta-Llama-3-8B-Instruct-w4a16-8-4096/README.md` dentro del repositorio
- Ficheros de licencia y atribucion en el repositorio: `LICENSE`, `Notice`, `USE_POLICY.md`
