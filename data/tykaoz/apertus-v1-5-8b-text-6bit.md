# TyKaoz/Apertus-v1.5-8B-text-6bit

## Resumen

Apertus-v1.5-8B-text-6bit es una cuantizacion a 6 bits en formato MLX del modelo `swiss-ai/Apertus-v1.5-8B`, publicada por el desarrollador TyKaoz. Se trata de la rama exclusivamente de texto del checkpoint omni de Apertus: se han extraido los pesos del modelo original y se han descartado las torres de imagen y audio junto con sus codebooks, dejando un modelo de generacion de texto de 8.053.338.112 parametros (~8,05 B) cuantizado a 6 bits con tamano de grupo 64, lo que ocupa aproximadamente 6,1 GB (repositorio de 6,5 GB).

El modelo base pertenece a la Swiss AI Initiative (EPFL, ETH Zurich y CSCS) y se distribuye bajo licencia Apache 2.0, con una politica de uso aceptable propia de Apertus. Esta cuantizacion conserva el tokenizador original, la plantilla de chat y una ventana de contexto de 262.144 tokens, y emplea la activacion xIELU caracteristica de la familia Apertus. Esta pensada para Apple Silicon y se ejecuta con `mlx-lm`.

Su relevancia practica es que permite ejecutar localmente un modelo de ~8 B con contexto de 256K en equipos Mac con memoria unificada, sin GPU dedicada ni servicios en la nube, manteniendo la licencia permisiva del modelo original. Conviene tener presente que es un artefacto de cuantizacion de un tercero: no anade entrenamiento propio ni ajuste alguno, solo la perdida de precision inherente a los 6 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Apertus, con activacion xIELU; no se detalla mas en la informacion disponible |
| Parametros totales | 8.053.338.112 (~8,05 B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 6 bits, group size 64 (MLX) |
| Idiomas soportados | en, fr, de, it, rm (romanche) |
| Licencia | Apache 2.0 (heredada del modelo base), sujeta a la politica de uso aceptable de Apertus |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | mlx-lm |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura en detalle. Se sabe que el modelo base es `swiss-ai/Apertus-v1.5-8B`, un modelo de la Swiss AI Initiative con activacion xIELU, y que el checkpoint original es multimodal (omni), con torres de imagen y audio y codebooks asociados. Esta publicacion es una extraccion de la rama de texto de esos pesos, por lo que no incluye componentes de vision ni de audio.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el proceso de cuantizacion mas alla de que se realizo con `mlx-lm` a 6 bits con grupo de 64. No hay innovaciones tecnicas atribuibles a esta cuantizacion; se limita a reducir la precision de los pesos del modelo base.

## Capacidades

- Generacion de texto y uso conversacional: la model card incluye la etiqueta `conversational` y la plantilla de chat del modelo base.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos o conversaciones muy largas.
- Multilingue: ingles, frances, aleman, italiano y romanche.
- Capacidades generales heredadas del modelo base (razonamiento, codigo, matematicas): no se aportan evaluaciones que las confirmen en esta cuantizacion concreta.
- Vision y audio: no disponibles; las torres correspondientes se han eliminado de este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de chat local en macOS: al estar cuantizado en MLX y ocupar ~6,1 GB, puede ejecutarse integramente en un Mac con memoria unificada mediante `mlx-lm`, sin conexion a internet y sin enviar datos a terceros.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite cargar informes, tesis o expedientes completos y pedir resumenes, extraccion de datos o preguntas sobre el contenido sin fragmentar el texto.
- Atencion al cliente multilingue: cubre las cinco lenguas declaradas y puede gestionar conversaciones multi-turno con historial extenso gracias al contexto de 256K.
- Analisis de documentacion tecnica o legal: util para revisar contratos, normativas o manuales extensos en local, con la ventaja de que el contenido sensible no sale del equipo.
- Traduccion entre lenguas europeas: el soporte de ingles, frances, aleman, italiano y romanche lo hace apto para flujos de traduccion interna en organizaciones suizas o europeas.
- Preservacion y tratamiento de lenguas minoritarias: el romanche es una lengua con pocos recursos; un modelo que lo declara explicitamente resulta util para prototipos de normalizacion, resumen o generacion asistida.
- Prototipado offline y entornos con requisitos de privacidad: al ejecutarse en local sobre Apple Silicon, encaja en escenarios sin salida a internet, como laboratorios, administraciones publicas o desarrollo en campo.
- Base para experimentacion en cuantizacion: sirve como referencia para comparar la calidad de la cuantizacion a 6 bits frente al modelo base en tareas concretas antes de adoptar un artefacto cuantizado en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base en su precision original.

## Requisitos de hardware

- Pesos cuantizados: aproximadamente 6,1 GB a 6 bits; el repositorio completo ocupa 6,5 GB.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card no especifica una cantidad minima de memoria del sistema.
- Memoria adicional: el KV cache escala con el contexto; con una ventana de hasta 262.144 tokens el consumo adicional puede ser muy elevado, aunque no se proporcionan cifras oficiales.
- GPU NVIDIA o AMD: el formato MLX no es compatible de forma directa con CUDA o ROCm; no disponible.
- Opciones de despliegue: `mlx-lm` (`pip install -U mlx-lm`; `mlx_lm.generate --model TyKaoz/Apertus-v1.5-8B-text-6bit --prompt ... --max-tokens 200`). vLLM, TGI, Ollama y llama.cpp no admiten este repositorio en formato MLX; para esas rutas habria que convertir o partir del modelo base.
- Latencia y throughput: no disponible.
- Cuantizaciones alternativas del mismo modelo: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `swiss-ai/Apertus-v1.5-8B` (base, omni) | ~8,05 B | 262.144 tokens | precision original (no especificada) | Apache 2.0 | HuggingFace |
| `TyKaoz/Apertus-v1.5-8B-text-6bit` | 8.053.338.112 (~8,05 B) | 262.144 tokens | 6 bits, group 64 (MLX) | Apache 2.0 | HuggingFace |
| Alternativas de tamano similar de otras familias | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otras familias de modelos de ~8 B no puede realizarse con los datos facilitados: no se han proporcionado especificaciones ni resultados de terceros. La diferencia principal frente al modelo base es el formato (MLX cuantizado frente a pesos originales) y el recorte de las capacidades de vision y audio.

## Limitaciones y advertencias

- Es una cuantizacion de terceros, no un modelo oficial de la Swiss AI Initiative; el soporte y la validacion dependen del autor del repositorio, con 0 descargas y 0 likes en el momento de la consulta.
- La cuantizacion a 6 bits puede degradar la calidad respecto al modelo base en tareas sensibles a la precision, como matematicas o razonamiento de varios pasos. No se aportan mediciones de esa perdida.
- Capacidades multimodales eliminadas: este checkpoint no procesa imagenes ni audio, aunque el modelo base sea omni.
- Sesgos: no se documentan en la informacion disponible. Al tratarse de un modelo entrenado por la Swiss AI Initiative y orientado a lenguas europeas, es previsible un sesgo hacia ese contexto cultural y linguistico, sin datos concretos que lo cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de veracidad para esta cuantizacion.
- Cobertura idiomatica limitada a cinco lenguas (en, fr, de, it, rm); el castellano no figura entre las lenguas declaradas.
- Licencia Apache 2.0 permisiva para uso comercial, pero sujeta a la politica de uso aceptable de Apertus, que puede imponer restricciones adicionales. Conviene revisarla antes de un despliegue comercial.
- Compatibilidad restringida: el formato MLX limita su uso a Apple Silicon a traves de `mlx-lm`; no es directamente desplegable en infraestructura CUDA.
- Contexto de 262.144 tokens: util, pero con un coste de memoria de KV cache que puede hacer inviable su uso a maxima longitud en equipos con poca memoria unificada.
- Sin benchmarks publicados, no es posible verificar el rendimiento real frente al modelo base ni frente a alternativas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/TyKaoz/Apertus-v1.5-8B-text-6bit
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Sitio del autor: https://www.tykaoz.bzh
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos correspondian a temas ajenos: foros de pantallas, catalogos de Netflix y comparativas de tarjetas graficas).
