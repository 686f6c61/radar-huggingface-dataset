# starjin2003/chameleon-qwen3.5-9b-gguf

## Resumen

Chameleon-qwen3.5-9b-gguf es una conversión a formato GGUF del modelo multimodal Qwen3.5-9B del equipo Qwen (Alibaba), publicada por el usuario starjin2003. No se trata de un modelo nuevo ni de un ajuste fino: es exclusivamente una conversión de formato y cuantización de los pesos originales, sin LoRA, sin merge y sin matriz de importancia. El repositorio contiene el modelo de lenguaje cuantizado a Q4_K_M y el proyector de visión (mmproj) en f16, listos para usarse con llama.cpp.

El modelo base Qwen3.5-9B es un transformer multimodal de aproximadamente 9.197 millones de parámetros que acepta entradas de imagen y texto y genera texto (pipeline image-text-to-text). Esta versión GGUF está pensada para ejecutarse en CPU mediante `llama-server`, lo que la hace relevante para despliegues sin GPU, contenedores Docker y entornos con recursos limitados.

La motivación declarada del autor es puramente operativa: alojar los ficheros para que la imagen Docker de su motor (Chameleon challenge, Adobe University Hackathon 2026) pueda construirse descargándolos desde este repositorio con verificación de sha256. El repositorio no está afiliado al equipo Qwen, a Alibaba ni a Adobe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-9B); detalles arquitectonicos del base no disponibles en la informacion proporcionada |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + f16 (proyector de vision mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: parte de los pesos safetensors de `Qwen/Qwen3.5-9B` en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` (4 shards) y aplica el pipeline de conversión de llama.cpp (tag `b11588`, commit `7f51953d7d2f359939a763549e93d51f0347e569`). Primero convierte el modelo de lenguaje a GGUF en bf16 (442 tensores, fichero intermedio de 18,4 GB no publicado) y el proyector de visión a GGUF en f16 (334 tensores). Después cuantiza el modelo de lenguaje a Q4_K_M con el binario `llama-quantize` de esa release, sin matriz de importancia: pasa de 17.544 MiB a 16,00 bits por peso a 5.502 MiB a 5,02 bits por peso.

Los metadatos GGUF conservan la plantilla de chat y el tokenizador del modelo base. El campo `general.name` contiene el nombre de la carpeta del snapshot (el hash de revisión), que el conversor lee de la ruta de entrada. No hay información en el material proporcionado sobre la composición del dataset de entrenamiento original, el número de tokens, ni si el modelo base usó RLHF o DPO; esos detalles corresponden a la model card de Qwen3.5-9B, no incluida aquí.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): el modelo recibe una imagen renderizada y una lista JSON de elementos y responde en JSON.
- Salida estructurada en JSON: en el caso de uso del autor, asigna a cada elemento su rol, nivel de importancia, agrupaciones (pares, categorías, contenedores) y orden de lectura.
- Decodificación greedy con thinking desactivado en el despliegue de referencia del autor.
- Capacidades de tool calling, agentes, matemáticas o código del modelo base: no disponibles en la información proporcionada; deben consultarse en la model card de Qwen3.5-9B.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Motor de maquetación editorial: el modelo lee una imagen renderizada de un diseño (lado mayor de 768 o 512 px) junto con un JSON de sus elementos y devuelve roles, niveles de importancia, agrupaciones y orden de lectura en JSON. El motor valida la respuesta y aplica sus propias reglas si es inválida o llega tarde.
- Despliegue en CPU sin GPU: al estar cuantizado a Q4_K_M y ejecutarse con `llama-server` en linux/amd64, encaja en contenedores Docker y servidores sin acelerador, con los ficheros incluidos en la imagen en tiempo de build.
- Procesamiento documental por lotes: extracción de estructura y jerarquía visual de capturas, páginas maquetadas o wireframes en pipelines offline donde la latencia no es crítica.
- Clasificación y anotación de elementos visuales: asignación de roles y categorías a componentes de una interfaz a partir de su representación renderizada y de metadatos JSON.
- Prototipado de asistentes multimodales: base para experimentar con entrada imagen-texto en local usando llama.cpp, sin depender de APIs externas.
- Entornos con verificación de integridad: el repositorio publica `SHA256SUMS` y hashes por fichero, lo que permite fijar una revisión concreta y comprobar la integridad en builds reproducibles.
- Inferencia de referencia para comparar cuantizaciones: útil para medir la pérdida de precisión de Q4_K_M frente a los pesos originales en tareas de comprensión de imagen y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo advierte de que la cuantización Q4_K_M reduce algo la precisión respecto a los pesos originales, sin cuantificar la pérdida.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M ocupa 5.780.090.752 bytes (unos 5,4 GiB) y el mmproj f16 918.165.920 bytes (unos 0,86 GiB); en total unos 6,2 GiB de pesos, más el overhead de contexto y del runtime.
- El despliegue de referencia del autor funciona solo en CPU, dentro de una imagen Docker linux/amd64, con `llama-server` de llama.cpp b11588.
- GPU: no se especifican modelos recomendados; al ser GGUF compatible con llama.cpp, puede ejecutarse con offload parcial o total en GPU, pero no hay datos de rendimiento en GPU en la información proporcionada.
- GPU de consumo: por tamaño de pesos (unos 6,2 GiB), cabría en GPUs con 8 GB o más de VRAM si se hace offload, aunque no está verificado en la información disponible.
- Opciones de despliegue: `llama-server` de llama.cpp con `--jinja` y `--mmproj` para el proyector de visión; otros runtimes compatibles con GGUF no están documentados en el repositorio.
- Latencia y throughput: no disponibles. El autor aplica un límite de tiempo por llamada en su motor y usa decodificación greedy, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| starjin2003/chameleon-qwen3.5-9b-gguf | 9.197.093.888 | no disponible | GGUF (Q4_K_M + mmproj f16) | Apache-2.0 | Cuantizacion de Qwen3.5-9B para llama.cpp en CPU |
| Qwen/Qwen3.5-9B | 9.197.093.888 | no disponible | safetensors | Apache-2.0 | Modelo base original, pesos completos |
| Otras cuantizaciones GGUF de Qwen3.5-9B | 9.197.093.888 | no disponible | GGUF | Apache-2.0 | No identificadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_K_M degrada la precisión respecto a los pesos originales en bf16; el autor lo indica explícitamente sin cuantificar la pérdida.
- No es un modelo ajustado: no incorpora fine-tuning, LoRA, merge ni matriz de importancia, por lo que su comportamiento es el del base cuantizado.
- El uso previsto declarado es muy específico (paso de edición de un motor de maquetación); para otros usos, las capacidades y límites son los del modelo base.
- Idiomas soportados, longitud de contexto y sesgos conocidos no están documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado en el material disponible; el autor mitiga el riesgo validando la respuesta JSON y aplicando reglas propias cuando es inválida o llega tarde.
- Licencia Apache-2.0, que permite uso comercial, pero el repositorio no está afiliado al equipo Qwen, a Alibaba ni a Adobe; conviene conservar el fichero LICENSE incluido, idéntico al del repositorio base.
- Dependencia de una release concreta de llama.cpp (b11588) para el despliegue de referencia; otras versiones pueden cambiar el comportamiento de la plantilla de chat o del proyector de visión.
- El campo `general.name` de los metadatos GGUF contiene el hash de revisión en lugar de un nombre legible, lo que puede confundir en inventarios automatizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/starjin2003/chameleon-qwen3.5-9b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
