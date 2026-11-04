# yasserrmd/LFM2.5-350M-JSON-NoFence

## Resumen

LFM2.5-350M-JSON-NoFence es una edicion de pesos del modelo LiquidAI/LFM2.5-350M, publicado por el usuario independiente yasserrmd (Mohamed Yasser). No se trata de un reentrenamiento ni de un fine-tuning: es una modificacion directa en el espacio de pesos (weight-space programming) que altera un total de 125.566 entradas, el 0,0354% de los 354.483.968 parametros del modelo base, sin gradientes, sin optimizador y sin retropropagacion. El objetivo es corregir un habito de formato: el modelo base, cuando se le pide responder solo con JSON, envuelve casi siempre la respuesta en un bloque de codigo markdown, lo que rompe los parsers estrictos.

La edicion afecta unicamente a dos tensores: la matriz `model.layers.14.feed_forward.w2.weight` (63.374 entradas modificadas en 64 de sus 4.608 columnas) y `model.layers.15.conv.out_proj.weight` (62.192 entradas en 64 de sus 1.024 columnas). En ambos casos se aplica una proyeccion de rango 1 que elimina una direccion concreta: la diferencia, escalada por la normalizacion final, entre los embeddings de salida del token de valla de codigo y del token `{"`.

El modelo es relevante como demostracion de una tecnica emergente de edicion quirurgica de modelos pequenos: consigue pasar de 1/48 a 28/48 respuestas JSON estrictas correctas en prompts retenidos, sin degradar la perplejidad en texto plano (44,54 frente a 44,58) ni romper otras capacidades, y con un parche auditable y reversible bit a bit. Es, sin embargo, un artefacto de investigacion con evaluacion muy limitada y una regresion conocida en arrays JSON de nivel superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia Liquid AI, transformer hibrido con capas convolucionales; detalles completos de la arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor evalua en BF16; el repo solo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0), con umbral de uso comercial en la seccion 5 |
| Formato de pesos | safetensors (transformers); parche adicional en `patch/chosen_patch.safetensors` y `.json` |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura del base LiquidAI/LFM2.5-350M (commit `9921cd4d82c0e3986887aa4b376f9446729ef8a3`), un modelo de 350M parametros de la familia LFM2.5 de Liquid AI, que combina capas de atencion con capas convolucionales (el tensor editado `conv.out_proj` de la capa 15 confirma la presencia de bloques convolucionales). No hay entrenamiento adicional: todos los ficheros salvo `model.safetensors` son copias sin modificar del repositorio original.

La innovacion tecnica es la edicion en espacio de pesos. Se calcula la direccion correspondiente a la diferencia entre los embeddings de salida del token de valla de codigo y del token `{"`, escalada por la normalizacion final, y se proyecta fuera de las columnas de dos matrices que presentaban la mayor "presion" medida hacia la valla. La edicion es de rango 1 y afecta a 64 columnas por tensor. El parche completo (valores originales y nuevos de cada entrada) se publica para auditoria y revertido bit a bit. No hay RLHF, DPO ni decodificacion especulativa asociada a esta edicion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Salida JSON estricta sin valla markdown cuando se solicita "JSON only": 28/48 respuestas correctas en la evaluacion del autor frente a 1/48 del base.
- Mantiene la generacion de bloques de codigo con valla cuando se pide explicitamente un bloque de codigo Python.
- Conserva el comportamiento general del base: 12/12 prompts de cordura superados y perplejidad en texto plano practicamente identica (44,58 frente a 44,54).
- No anade capacidades nuevas: los errores de contenido (ordenacion, conteo de letras, etc.) persisten igual que en el base.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Extraccion de datos estructurados en pipelines: el modelo convierte texto libre en JSON sin valla markdown, lo que permite alimentar directamente un `json.loads()` sin preprocesado de limpieza. Adecuado por su tamano reducido y su tasa de exito en formato estricto.
- Clasificacion y etiquetado por lotes: al devolver JSON limpio, puede usarse en procesos de anotacion masiva donde el parser rechaza bloques de codigo, con coste computacional minimo (350M parametros).
- Prototipado rapido en local: cabe en GPUs de consumo y permite iterar sobre prompts de extraccion JSON en un portatil con RTX 3060, como en la evaluacion del autor.
- Generacion de respuestas de API simuladas: util para construir mocks y fixtures de tests que requieren cuerpos JSON validos sin formateo adicional.
- Educacion e investigacion sobre edicion de modelos: el parche auditable y reversible lo convierte en un caso de estudio para ensenar weight-space programming y evaluar el impacto de ediciones de rango 1.
- Preprocesado en pipelines de agentes: como paso intermedio que normaliza la salida a JSON antes de pasarla a un orquestador, aunque con la cautela de la regresion en arrays de nivel superior.
- Filtrado y validacion de formularios: extraccion de campos concretos (nombre, edad, etc.) de texto no estructurado en ingles, siempre que la salida esperada sea un objeto y no un array.

## Benchmarks y rendimiento

Evaluacion del autor sobre 12 prompts no vistos, cada uno con decodificacion greedy y 3 semillas muestreadas (T=0,7, top-p 0,95, top-k 50), total 48 respuestas, en RTX 3060 y BF16:

| Metrica | Base | Este modelo | 3 ediciones aleatorias emparejadas |
|---|---|---|---|
| Exito JSON estricto | 1/48 | 28/48 | 1/48 cada una |
| Respuesta empieza con valla de codigo | 41/48 | 0/48 | 40-41/48 |
| Prompts de cordura general | 12/12 | 12/12 | 12/12 |
| Perplejidad en texto plano | 44,54 | 44,58 | 44,52-44,70 |

Comparacion pareada con el base: 27 respuestas corregidas, 0 rotas (McNemar exacto p = 1,5e-8). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 0,7 GB de pesos (354M parametros x 2 bytes) mas overhead de activaciones y cache KV; en cuantizacion de 8 bits o 4 bits seria considerablemente menor, aunque el repo no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para BF16; el autor valida en RTX 3060.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU con suficiente RAM.
- Opciones de despliegue: transformers (uso documentado por el autor); vLLM, llama.cpp, Ollama o TGI no estan verificados en la informacion proporcionada, y al no haber GGUF publicado habria que convertirlo.
- Latencia y throughput: no disponibles; solo se indica la plataforma de evaluacion (RTX 3060, BF16) sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-350M-JSON-NoFence (este) | 354M | no disponible | Edicion de pesos para JSON sin valla | LFM Open License v1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | Modelo generalista | LFM Open License v1.0 | HuggingFace, oficial |
| Qwen3.5 (referencia citada por el autor) | no disponible | no disponible | Weight-space programming analogo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Regresion conocida: los arrays JSON de nivel superior fallan; el modelo tiende a abrir con `{` y devuelve `{"result": [...]}` en lugar de un array desnudo (0/16 respuestas de array correctas).
- Una respuesta de validacion de un candidato cercano degenero en repeticion de caracteres `"`.
- La edicion solo repara un habito de formato; no anade capacidad. Persisten errores de contenido como ordenacion o conteo de letras.
- Evaluacion muy pequena: 12 prompts retenidos por categoria, solo en ingles y con un unico estilo de prompt. No es una reproduccion del resultado de Qwen3.5.
- No es una release oficial de Liquid AI; el autor es independiente y el modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- Licencia LFM Open License v1.0 con umbral de uso comercial en la seccion 5: revisar antes de desplegar en produccion.
- Solo soporta ingles declarado; el uso en otros idiomas no esta validado.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion disponible.
- El artefacto incluye un parche auditable y reversible, pero cualquier despliegue debe verificar el comportamiento en los prompts concretos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasserrmd/LFM2.5-350M-JSON-NoFence
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio de Liquid AI: https://huggingface.co/LiquidAI
- Parche auditable: incluido en el repo en `patch/chosen_patch.safetensors` y `patch/chosen_patch.json`
- Model card original del base: `README_LiquidAI_original.md` dentro del repositorio
- Licencia: `LICENSE` dentro del repositorio (LFM Open License v1.0)
