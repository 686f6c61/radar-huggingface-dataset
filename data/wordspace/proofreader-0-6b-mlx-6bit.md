# wordspace/proofreader-0.6B-MLX-6bit

## Resumen

proofreader-0.6B-MLX-6bit es un modelo de correccion de estilo en miniatura desarrollado por wordspace, el equipo de la aplicacion de notas del mismo nombre. Se trata de un ajuste fino con LoRA sobre Qwen3-0.6B-Base, fusionado y cuantizado a 6 bits para el framework MLX de Apple. Su proposito es muy concreto: dado un texto breve, detectar frases rebuscadas, verbosas o torpes, copiarlas literalmente y proponer una alternativa mas corta, devolviendo un unico objeto JSON y deteniendose. Si el texto esta bien, no responde nada.

La relevancia del modelo no reside en su tamano, sino en su especializacion. Con solo 596 millones de parametros y unas 18 tokens de salida de media, supera en la tarea de deteccion de estilo a gemma-3-4b-it (cuantizado QAT a 4 bits) en el conjunto de pruebas ciego del autor: encuentra 82 de 103 frases verbosas frente a 26, y sus correcciones se juzgan buenas en 50 casos frente a 4. Ademas, es entre cuatro y cinco veces mas rapido en Apple Silicon (0,15 s por frase frente a 0,64 s).

El modelo forma parte de una arquitectura de producto en la que la ortografia y la gramatica las resuelve el sistema operativo y el modelo se limita al estilo. Soporta italiano, ingles, espanol, frances, aleman y portugues, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B-Base), ajuste fino con LoRA rank 16 en todas las capas |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 6 bits para MLX (existe version a plena precision segun la model card) |
| Idiomas soportados | italiano, ingles, espanol, frances, aleman, portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3, y se ajusta con LoRA de rango 16 aplicado a todas las capas, con optimizador AdamW, tasa de aprendizaje 1e-4 y recorte de gradiente por norma 1. La perdida se calcula unicamente sobre los tokens de respuesta y cada respuesta se cierra con el token de fin de texto para que el modelo aprenda a detenerse. El checkpoint se selecciono por rendimiento en la tarea sobre validacion (frases verbosas encontradas y frases limpias respetadas), no por perdida. Posteriormente se fusionaron los adaptadores y se cuantizo a 6 bits para MLX.

El conjunto de entrenamiento consta de 24.000 casos sinteticos generados a partir de plantillas escritas a mano en seis idiomas, con aproximadamente 185 plantillas de frases verbosas y 130 de frases limpias por idioma, la mayoria redactadas por autores que no habian visto las de los demas para que el modelo aprenda la tarea y no los habitos de un escritor concreto. Incluye pares minimos (la misma frase con defectos marcados y ya concisa, para que aprenda la formulacion y no el tema), notas limpias y parrafos mixtos; casi la mitad de los casos no tienen nada que corregir. Una de cada cinco plantillas se reservo solo para validacion. Se descarto cualquier caso generado que compartiera ocho palabras consecutivas con una frase de prueba, y no se usaron notas personales.

## Capacidades

- Deteccion de estilo: identifica frases verbosas, estilo nominal ("llevar a cabo una inspeccion de") y redundancias ("repetir de nuevo").
- Salida estructurada: responde con un unico objeto JSON con sugerencias de tipo `style`, cada una con el fragmento original copiado literalmente y una propuesta de reemplazo mas breve.
- Abstención: cuando el texto no requiere cambios, no emite sugerencia alguna.
- Multilingue: funciona en italiano, ingles, espanol, frances, aleman y portugues.
- Respuesta corta y determinista: genera en modo greedy, con una media de 18 tokens de salida, y se detiene en su token de fin de texto.
- No cubre ortografia ni gramatica: el autor indica explicitamente que no esta entrenado para corregirlas y que debe dejarlas intactas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Correccion de estilo en tiempo real en editores de notas: el modelo esta disenado para ejecutarse mientras el usuario escribe, con 0,15 s de mediana por frase en Apple Silicon, lo que permite subrayar frases rebuscadas sin bloquear la interfaz.
- Integracion en aplicaciones de escritura nativas de macOS: al estar empaquetado para MLX, se ejecuta en el hardware de Apple sin GPU dedicada, lo que simplifica el despliegue en aplicaciones de escritorio.
- Revision de documentacion tecnica y textos corporativos: detecta formulaciones nominales y redundancias frecuentes en manuales y notas internas en cualquiera de los seis idiomas soportados.
- Preprocesado de textos antes de publicacion: como paso previo a la revision humana, filtra frases verbosas y reduce la carga de edicion en boletines, notas de prensa o entradas de blog.
- Asistencia multilingue en equipos distribuidos: al cubrir espanol, frances, aleman, italiano, portugues e ingles, sirve para revisar mensajes y notas en varios idiomas con un unico modelo pequeno.
- Filtrado por lotes de notas breves: con una salida media de 18 tokens y un modelo de 0,6B, se pueden procesar grandes volumenes de frases cortas en local con coste computacional minimo.
- Componente de estilo en pipelines de agentes de escritura: la salida JSON estricta facilita su integracion como paso de post-procesado en herramientas de edicion automatizada.

## Benchmarks y rendimiento

Prueba ciega: 217 frases (103 verbosas, 114 limpias) escritas por seis autores independientes, uno por idioma, sin acceso a las plantillas de entrenamiento ni a pruebas anteriores; un segundo lector reetiqueto todo y se descartaron los casos en desacuerdo. Ninguna frase comparte ocho palabras consecutivas con los datos de entrenamiento. Comparacion con la version anterior del modelo y con gemma-3-4b-it (QAT, 4 bits), con el mismo prompt.

| Metrica | Este modelo | Version anterior | gemma-3-4b |
|---|---|---|---|
| Frases verbosas encontradas | 82/103 | 65/103 | 26/103 |
| Correccion juzgada buena | 50/103 | 18/103 | 4/103 |
| · frase ausente de toda plantilla (58) | 18/58 | 2/58 | 1/58 |
| Frases limpias tocadas (el dano) | 8/114 | 5/114 | 18/114 |

Significacion estadistica (McNemar exacto sobre las mismas frases): frente a la version anterior, encontradas p = 0,002, juzgadas buenas p < 0,001, dano p = 0,51; frente a gemma, todos los p < 0,001 salvo el dano, p = 0,052. Frases verbosas encontradas por idioma: aleman 13/16, ingles 15/16, espanol 15/17, frances 14/19, italiano 14/18, portugues 11/17.

Sonda escrita a mano: 192 frases, 32 por idioma, redactadas por los autores de las plantillas de entrenamiento; 60 con una frase conocida por las plantillas en oraciones nuevas, 36 con frases ausentes de las plantillas originales y 96 limpias.

| Metrica | Este modelo | gemma-3-4b | p |
|---|---|---|---|
| Frases verbosas encontradas | 88/96 | 27/96 | < 0,001 |
| · frases conocidas, oraciones nuevas | 59/60 | 18/60 | < 0,001 |
| · otras frases | 29/36 | 9/36 | < 0,001 |
| Frases limpias tocadas (el dano) | 2/96 | 8/96 | 0,070 |
| Segundos por frase (mediana, Apple silicon) | 0,15 | 0,64 | — |

En las ocho frases verbosas y ocho limpias de la prueba propia de la aplicacion: 7/8 encontradas frente a 3/8, sin frases limpias tocadas por ninguno de los dos. El modelo de 6 bits da las mismas respuestas que el de plena precision dentro del ruido (prueba ciega: 82 frente a 82 encontradas, 8 frente a 8 tocadas; sonda: 88 frente a 88 encontradas, 2 frente a 3 tocadas).

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,0 GB con pesos de 6 bits; la inferencia requiere del orden de 1 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: el modelo esta empaquetado para MLX, por lo que el objetivo son chips de Apple (series M1, M2, M3, M4 y posteriores). No se documenta soporte para CUDA.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon, dado su tamano inferior a 1 GB en 6 bits.
- Opciones de despliegue: `mlx-lm` (libreria oficial del modelo); el autor no documenta vLLM, llama.cpp, Ollama ni TGI, y el formato MLX no es directamente compatible con ellos sin conversion.
- Latencia y throughput: 0,15 s de mediana por frase en Apple Silicon segun la sonda del autor, frente a 0,64 s de gemma-3-4b-it en el mismo hardware. El throughput agregado no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofreader-0.6B-MLX-6bit | 0,6B | no disponible | Correccion de estilo, 6 idiomas | Apache 2.0 | Hugging Face, formato MLX |
| gemma-3-4b-it (QAT 4 bits) | 4B | no disponible | Proposito general, usado como referencia en la tarea | Gemma (terminos propios) | Hugging Face, amplia disponibilidad |
| Version anterior de proofreader-0.6B | 0,6B | no disponible | Correccion de estilo, 6 idiomas | Apache 2.0 | Referenciada en la model card, sin enlace directo |
| Qwen3-0.6B-Base | 0,6B | no disponible | Modelo base de proposito general | Apache 2.0 | Hugging Face |

Frente a gemma-3-4b-it, el modelo especializado encuentra mas del triple de frases verbosas (82 frente a 26 en la prueba ciega) y produce correcciones buenas en 50 casos frente a 4, con un dano menor en frases limpias (8 frente a 18) y una latencia cuatro veces inferior. Frente a su version anterior mejora en deteccion (82 frente a 65) y en calidad de correccion (50 frente a 18), aunque toca algo mas de frases limpias (8 frente a 5). No se dispone de datos de contexto ni de benchmarks estandar (MMLU, HumanEval, GSM8K) para ninguno de los modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo estilo: no corrige ortografia ni gramatica y no debe usarse para ello; el autor indica que esta entrenado para dejarlas intactas.
- Frases fuera de lo aprendido: propone una correccion buena en menos de una de cada tres frases (18/58 en la prueba ciega), por lo que las sugerencias deben tratarse como tales.
- Falsos positivos: en notas de validacion reservadas toca el 9 % de las frases limpias (15/173), mas en gemelos limpios de frases verbosas (16 %) y especialmente en aleman (7 de 29 casos limpios alemanes, frente a 0 de 35 en ingles). El aleman es el idioma mas debil.
- Alcance de entrada: entrenado con notas breves (frases y parrafos de pocas frases); no se documenta su comportamiento con documentos largos.
- Dependencia del protocolo: el prompt de sistema debe mantenerse identico caracter por caracter y la generacion debe ser greedy; desviarse de `protocol.py` puede alterar los resultados.
- Formato y ecosistema: los pesos estan en formato MLX, lo que limita el despliegue a hardware Apple o exige conversion para otros runtimes.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` con la lista completa de cambios respecto al modelo base.
- Riesgo de alucinacion: no se documenta de forma especifica; la salida esta restringida a un objeto JSON corto, lo que reduce el riesgo, pero el modelo podria citar fragmentos que no aparezcan literalmente en el texto, por lo que el autor recomienda filtrar las sugerencias cuyo campo `original` no este presente en el texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wordspace/proofreader-0.6B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Aplicacion wordspace: https://getwordspace.com
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
