# veri2-anon/sva-qlora-syntax_pass

## Resumen

sva-qlora-syntax_pass es un adaptador QLoRA (LoRA cuantizado) publicado por el usuario veri2-anon sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que se aplican sobre el modelo base para especializarlo en una tarea muy concreta: la generacion de SystemVerilog Assertions (SVA) a partir de codigo RTL. El adaptador se ha entrenado exclusivamente con pares que superan la comprobacion de sintaxis (la denominada variante "Syntax").

El modelo base, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only de 7.000 millones de parametros desarrollado por Alibaba Qwen, orientado a tareas de codigo e instrucciones, con una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5). El adaptador hereda esa arquitectura y ese contexto: no anade parametros al backbone, solo modifica las proyecciones mediante matrices LoRA de rango bajo, por lo que su huella adicional es minima (el repositorio ocupa 0,6 GB, coherente con pesos LoRA en safetensors junto a posibles artefactos de entrenamiento).

La relevancia de esta publicacion es acotada pero util para el nicho de la verificacion formal de hardware: permite adaptar un modelo de codigo generalista a la generacion de aserciones SVA sin reentrenar el modelo completo, reduciendo coste computacional. Sin embargo, la informacion publicada es muy escasa (sin licencia declarada, sin idiomas declarados, sin metricas de rendimiento en la model card) y el repositorio no registra descargas ni interacciones, lo que en la practica limita su uso en produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) con adaptador LoRA cuantizado (QLoRA) |
| Parametros totales | no disponible (modelo base: 7.000 millones; el adaptador anade un numero reducido de parametros LoRA, no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con configuracion extendida) |
| Tipos de cuantizacion | no disponible (el adaptador es QLoRA, lo que implica entrenamiento sobre base cuantizada; no se detallan los formatos de pesos publicados) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); compatible con el modelo base en safetensors o GGUF tras fusion y conversion |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tamano del repositorio | 0,6 GB |
| Dominio de especializacion | SystemVerilog Assertions (SVA) generadas desde RTL |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only denso de la familia Qwen2.5-Coder, que emplea atencion causal estandar con RoPE, normalizacion RMSNorm y activacion SwiGLU. El entrenamiento se realiza con QLoRA: el modelo base se cuantiza (tipicamente a 4 bits, aunque el autor no especifica el esquema exacto) y se congelan sus pesos, anadiendo matrices LoRA entrenables de bajo rango en las proyecciones de atencion y/o MLP. Esta tecnica permite ajustar un modelo de 7.000 millones de parametros con un coste de memoria muy inferior al fine-tuning completo.

En cuanto a los datos, la model card indica que el adaptador se ha entrenado con "los pares que pasan la comprobacion de sintaxis (la variante Syntax)", es decir, un subconjunto filtrado de pares RTL-SVA en el que la asercion generada es sintacticamente valida. No se especifica el numero de ejemplos, la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El autor remite a un repositorio anonimo (anonymous.4open.science/r/veri2-CD05/) para el codigo, el dataset y los resultados, pero esos detalles no estan incluidos en la informacion disponible. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de SystemVerilog Assertions (SVA) a partir de descripciones RTL, que es la tarea objetivo del adaptador.
- Generacion de codigo en SystemVerilog y, por herencia del modelo base, en otros lenguajes de programacion (Python, C, Java, etc.), aunque el adaptador no ha sido optimizado para ello.
- Razonamiento sobre especificaciones de hardware y propiedades de verificacion formal.
- Seguimiento de instrucciones en formato chat, heredado del modelo base Instruct.
- Soporte de tool calling y function calling: no documentado en el adaptador; el modelo base Qwen2.5-Coder-7B-Instruct lo soporta, pero se desconoce si el adaptador lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para el adaptador.
- Capacidades multilingues: no disponibles; el modelo base soporta multiples idiomas, pero el adaptador no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion asistida de aserciones SVA en verificacion funcional: dado un modulo RTL en SystemVerilog, el adaptador propone aserciones sintacticamente validas que el ingeniero de verificacion puede revisar e integrar en el testbench. Es adecuado porque se ha entrenado especificamente con pares que superan la comprobacion de sintaxis.
- Prototipado rapido de propiedades de verificacion: en fases tempranas de diseno, permite generar un borrador de aserciones para modulos nuevos y acelerar la escritura del entorno de verificacion.
- Formacion y docencia en verificacion de hardware: sirve para ilustrar como se traduce una especificacion RTL en aserciones SVA, con la ventaja de que el modelo parte de un base de codigo solido.
- Automatizacion de revision de especificaciones: integrado en un pipeline que reciba fragmentos RTL de un repositorio y genere candidatos de SVA para su validacion posterior con herramientas de lint o simuladores formales.
- Generacion de tests de regresion sintactica: el adaptador puede emplearse para producir ejemplos de SVA que pasen comprobacion de sintaxis, utiles para construir suites de prueba de herramientas EDA.
- Asistente interno para equipos de diseno: desplegado en un entorno controlado (por ejemplo, con vLLM o llama.cpp tras fusionar el adaptador con el base), puede responder consultas sobre como escribir aserciones para patrones RTL concretos, siempre con revision humana.
- Base para experimentos de investigacion en generacion de codigo especifico de dominio: el adaptador sirve como punto de partida para estudiar el efecto del filtrado por sintaxis en la calidad de las aserciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un repositorio anonimo externo para consultar resultados, pero no se incluyen metricas (MMLU, HumanEval, GSM8K ni metricas especificas de SVA como tasa de sintaxis valida o cobertura funcional) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,6 GB, pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct. En FP16, el base necesita aproximadamente 14-15 GB de VRAM; en cuantizacion de 8 bits, unos 8 GB; en 4 bits (GGUF Q4_K_M), alrededor de 4,5-5 GB.
- GPU recomendadas: para FP16, una A100 40 GB, H100 o RTX 4090 (24 GB) son suficientes; para cuantizacion 4/8 bits, una RTX 3060 12 GB o RTX 4060 Ti 16 GB puede ser suficiente.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas (4-8 bits) sobre RTX 3060, RTX 4060 Ti, RTX 4070 o superiores.
- Opciones de despliegue: vLLM (fusionando el adaptador con el base), TGI, llama.cpp/Ollama (requiere fusion y conversion a GGUF), o carga directa con PEFT y transformers.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y la implementacion de inferencia elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sva-qlora-syntax_pass (este) | Adaptador LoRA sobre base de 7B | Heredado del base (32.768 nativos) | Adaptador QLoRA especializado en SVA | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 nativos (hasta 131.072) | Modelo completo generalista de codigo | Apache 2.0 (segun la familia Qwen2.5) | Hugging Face, ampliamente usado |
| Adaptadores LoRA genericos para Verilog/SystemVerilog | Variable | Heredado del base | Adaptadores especializados en HDL | Variable | Depende del autor |

La comparativa directa con otros adaptadores especializados en SVA no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador sacrifica generalidad a cambio de especializacion en una tarea concreta (SVA desde RTL), pero no publica metricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un subconjunto filtrado por sintaxis, puede sobreajustarse a los patrones presentes en ese dataset y fallar en estilos RTL no representados.
- Riesgo de alucinacion: alto en tareas de generacion de codigo y aserciones; las SVA generadas pueden ser sintacticamente validas pero semanticamente incorrectas respecto al RTL original, por lo que requieren validacion formal.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; el contexto efectivo depende del modelo base y de la configuracion de despliegue.
- Restricciones de licencia para uso comercial: la licencia del adaptador no esta declarada, lo que impide determinar si se permite uso comercial. El modelo base Qwen2.5-Coder se distribuye bajo Apache 2.0, pero esa licencia no cubre automaticamente los pesos del adaptador si el autor no la declara.
- Caveat de produccion: repositorio sin descargas ni interacciones, sin evaluacion independiente publicada y sin metricas en la model card; no se recomienda su uso en produccion sin una validacion exhaustiva previa.
- El repositorio ocupa 0,6 GB, lo que sugiere que puede contener artefactos de entrenamiento ademas de los pesos LoRA; conviene revisar el contenido antes de integrarlo en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/veri2-anon/sva-qlora-syntax_pass
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio anonimo con codigo, dataset y resultados: https://anonymous.4open.science/r/veri2-CD05/
