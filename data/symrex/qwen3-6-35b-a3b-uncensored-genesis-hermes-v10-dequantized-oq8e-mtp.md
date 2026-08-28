# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ8e-mtp

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ8e-mtp` es una variante cuantizada del modelo Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura mixta de expertos (MoE) desarrollado originalmente por Alibaba. Esta versión concreta ha sido posteriormente ajustada y modificada por la comunidad: aplica la técnica de post-entrenamiento "Genesis" (desarrollada por LuffyTheFox) para reducir el ruido acumulado durante el entrenamiento, y un ajuste fino de tipo "Hermes" orientado a conversaciones sin censura. El resultado es un modelo de 35.000 millones de parámetros totales con solo 3.000 millones activos por token, lo que permite su ejecución en hardware de consumo.

La versión aquí descrita ha sido cuantizada por el usuario `symrex` utilizando la herramienta oQ (oMLX v0.6.3) con precisión mixta de 8 bits y tamaño de grupo 64, en formato MLX safetensors. Esto reduce significativamente los requisitos de memoria respecto al modelo original, manteniendo un buen equilibrio entre rendimiento y fidelidad. El modelo está diseñado para ejecutarse en dispositivos Apple Silicon mediante MLX, aunque también puede convertirse a otros formatos. Su relevancia actual radica en que combina un rendimiento de vanguardia en tareas de codificación (73,4% en SWE-bench Verified) con la posibilidad de ejecutarse localmente en una GPU de consumo, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), tipo `qwen3_5_moe` |
| Parametros totales | 35.000 millones (nominal) / 10.433.874.864 (segun safetensors) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ8e), grupo 64, precision mixta |
| Idiomas soportados | no disponible (modelo base Qwen3.6 soporta multilingue) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado con oQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales, de los cuales solo 3.000 millones se activan por token. Esta arquitectura permite un rendimiento comparable a modelos densos mucho mayores, con un coste computacional reducido. El modelo original fue entrenado por Alibaba con un enfoque en tareas de razonamiento, codificacion y capacidades multilingues.

Sobre esta base, LuffyTheFox aplico la tecnica "Genesis", un metodo de post-entrenamiento propietario que repara el tensor acumulado para reducir el ruido de entrenamiento y mejorar la consistencia de las salidas. Posteriormente, se aplico un ajuste fino de tipo "Hermes" (basado en el trabajo de Nous Research) orientado a conversaciones sin censura y con mayor adherencia a las instrucciones del usuario. Finalmente, `symrex` cuantizo el modelo resultante con oQ (oMLX v0.6.3) utilizando precision mixta de 8 bits con tamaño de grupo 64, lo que reduce el peso del modelo de aproximadamente 70 GB a 38,6 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno sin censura, con alta adherencia a las instrucciones del usuario.
- Razonamiento complejo y resolucion de problemas en multiples dominios, incluyendo matematicas y logica.
- Generacion de codigo en multiples lenguajes de programacion, con soporte para tareas de ingenieria de software reales (SWE-bench).
- Capacidades multimodales (segun la documentacion de Genesis Hermes V9, el modelo base soporta vision, aunque no se confirma en esta version).
- Soporte de tool calling y function calling (heredado de la familia Qwen3.6).
- Capacidades de agente y razonamiento multi-paso.
- Multilingue (el modelo base Qwen3.6 soporta multiples idiomas, aunque no se especifican cuales en esta variante).

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en IDEs como VS Code o Neovim para proporcionar autocompletado, generacion de funciones y refactorizacion de codigo. Su tamaño compacto (3B activos) permite una latencia aceptable en una GPU de consumo.
- Agente de automatizacion de tareas: gracias a su soporte de tool calling, puede utilizarse como backend para agentes que interactuan con APIs, ejecutan comandos o gestionan flujos de trabajo.
- Chatbot sin censura para investigacion: su ajuste "uncensored" lo hace util para explorar temas sensibles o controversiales sin restricciones politicamente correctas, aunque con los riesgos asociados.
- Desarrollo de aplicaciones RAG: su ventana de contexto (aunque no especificada) y su capacidad de razonamiento lo hacen adecuado para sistemas de recuperacion aumentada en dominios tecnicos.
- Prototipado rapido de modelos de IA: al ser cuantizado y ejecutable en MLX, permite iterar rapidamente en entornos Apple Silicon sin necesidad de infraestructura cloud.
- Educacion y formacion en IA: su licencia abierta (aunque no especificada) y su disponibilidad en HuggingFace lo hacen accesible para proyectos academicos y de investigacion.

## Benchmarks y rendimiento

Segun los resultados de busqueda web, el modelo base Qwen3.6-35B-A3B alcanza un 73,4% en SWE-bench Verified, superando a Google Gemma 4 (52,0%) en tareas de ingenieria de software reales. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) para esta variante cuantizada especifica.

| Benchmark | Qwen3.6-35B-A3B | Gemma 4 |
|---|---|---|
| SWE-bench Verified | 73,4% | 52,0% |

Nota: estos datos provienen de una fuente externa (aitecharchive.com) y no han sido verificados de forma independiente. La cuantizacion a 8 bits puede introducir una degradacion menor del rendimiento respecto al modelo original.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 8 bits ocupa aproximadamente 38,6 GB en disco. Para inferencia, se recomienda al menos 40 GB de memoria unificada en Apple Silicon o 48 GB de VRAM en GPU NVIDIA.
- GPU recomendadas: Apple Silicon (M1 Ultra, M2 Ultra, M3 Max) con 64 GB o mas de memoria unificada; NVIDIA RTX 4090 (24 GB) no es suficiente para la version completa, pero podria ejecutarse con cuantizaciones mas agresivas (4 bits).
- En consumer GPU: no cabe en GPUs de 24 GB o menos con esta cuantizacion. Se necesitarian cuantizaciones de 4 bits o menor para ejecutarse en RTX 3090/4090.
- Opciones de despliegue: MLX (nativo), conversion a GGUF para llama.cpp/Ollama, o vLLM con soporte MoE.
- Latencia y throughput: no disponible. Como referencia, modelos MoE con 3B activos suelen generar entre 20-40 tokens/segundo en hardware moderno, pero depende de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | no disponible | 73,4% | no disponible |
| Gemma 4 | no disponible | no disponible | no disponible | 52,0% | no disponible |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | no disponible | MIT |

La comparativa se basa en datos publicados en la busqueda web. No se dispone de informacion suficiente sobre Gemma 4 para una comparacion completa. DeepSeek-Coder-V2-Lite es una alternativa de codigo abierto con arquitectura MoE similar, aunque con menos parametros totales.

## Limitaciones y advertencias

- El ajuste "uncensored" puede producir contenido inapropiado, ofensivo o peligroso. No debe utilizarse en aplicaciones orientadas al publico general sin filtros adicionales.
- La licencia no esta especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar con el autor antes de desplegar en produccion.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad de las respuestas en tareas complejas de razonamiento.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El modelo base Qwen3.6 puede tener sesgos heredados de sus datos de entrenamiento, que el ajuste "uncensored" podria amplificar.
- La comunidad que rodea a este modelo es pequena y no hay garantias de mantenimiento o soporte a largo plazo.
- El nombre del modelo incluye "V10", lo que sugiere iteraciones frecuentes; la version aqui descrita puede quedar obsoleta rapidamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ8e-mtp
- Version V6 (oQ4e): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ4e-mtp
- Version V6 (oQ8e): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ8e-mtp
- Herramienta de cuantizacion oQ: https://github.com/jundot/omlx
- Guia de Qwen3.6-35B-A3B como modelo local de codificacion: https://aitecharchive.com/articles/qwen-3-6-35b-a3b-moe-model-guide
- Guia de ejecucion de Genesis Hermes en casa: https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Analisis de Genesis Hermes V9: https://hackernoon.com/inside-qwen36-genesis-hermes-v9
