# Suvir-Misra/gpt-oss-20b-indian-legal-GGUF

## Resumen
GPT-OSS 20B Indian Legal es un ajuste fino del modelo GPT-OSS 20B de OpenAI orientado a consultoria juridica y fiscal india, publicado por Suvir Misra. El repositorio que nos ocupa contiene los pesos cuantizados en formato GGUF del modelo fusionado (`gpt-oss-20b-indian-legal-merged`), pensados para despliegue local mediante Ollama, llama.cpp, LM Studio o llama-cpp-python. Cubre el marco del GST (CGST, IGST, UTGST y reglas asociadas), la Ley de Aduanas de 1962, la Ley del Impuesto sobre la Renta de 1961 y los codigos penales y probatorios de 2023 (BNS, BNSS, BSA).

El modelo parte de una arquitectura Mixture of Experts de 20.914.757.184 parametros totales con 32 expertos y aproximadamente 2.4B de parametros activos por token, segun declara el autor. Se distribuye en tres precisiones (Q4_K_M, Q8_0 y BF16) con tamanos de 15,1 GB, 21,2 GB y 41,8 GB respectivamente, lo que permite ejecutarlo desde estaciones de trabajo con 16 GB de VRAM hasta clusters de CPU.

Su relevancia practica radica en la especializacion vertical: frente a un modelo generalista, incorpora alineamiento sobre benchmarks estatutarios y judiciales indios y admite prompts con formato de chat estructurado (`<|start|>...<|message|>`), lo que facilita integrarlo en asistentes de atencion fiscal, revision de contratos o analisis de jurisprudencia. La licencia Apache 2.0 elimina las restricciones de uso comercial habituales en modelos legales propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 32 expertos, base GPT-OSS 20B |
| Parametros totales | 20.914.757.184 (20,9B) |
| Parametros activos | ~2,4B por token (32x2.4B, segun el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4-bit mix), Q8_0 (8-bit), BF16 (16-bit) |
| Idiomas soportados | en, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base fusionado) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura GPT-OSS 20B, un transformer con capas de mezcla de expertos (MoE) de 32 expertos y aproximadamente 2,4B de parametros activos por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso del mismo tamano total. El ajuste fino se realizo sobre el modelo fusionado `Suvir-Misra/gpt-oss-20b-indian-legal-merged` y la cuantizacion se genero con Unsloth, segun las etiquetas del repositorio.

La model card declara un proceso de "alineamiento riguroso" sobre benchmarks estatutarios y judiciales indios, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se especifican innovaciones tecnicas adicionales mas alla de las propias de la arquitectura GPT-OSS subyacente. Toda la informacion sobre el proceso de entrenamiento mas alla de lo citado debe considerarse no disponible.

## Capacidades
- Generacion de texto y razonamiento juridico estructurado segun el marco IRAC (Issue, Rule, Application, Conclusion), segun declara el autor.
- Consultoria fiscal: GST (CGST, IGST, UTGST, reglas de 2017), Impuesto sobre la Renta de 1961, precios de transferencia, DTAA y circulares de la CBDT.
- Aduanas y comercio exterior: Ley de Aduanas de 1962, Arancel de Aduanas de 1975, Politica de Comercio Exterior 2023, esquema MoOWR y circulares de la CBIC.
- Derecho penal y probatorio de 2023: BNS, BNSS y BSA.
- Derecho corporativo y comercial: Ley de Sociedades de 2013, IBC de 2016, FEMA de 1999 y Ley de Competencia de 2002.
- Identificacion de ratio decidendi en resoluciones del Tribunal Supremo, tribunales superiores y tribunales especializados (CESTAT, ITAT), segun la model card.
- Soporte bilingue ingles-hindi (en, hi).
- Formato de chat estructurado compatible con llama.cpp y Ollama.
- No se declara soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- No se declara capacidad de vision ni audio.

## Casos de uso
- Asistencia fiscal en GST: el modelo puede responder consultas sobre admisibilidad de credito fiscal (ITC), como el ejemplo de la model card sobre gastos de CSR y la Seccion 17(5)(fa) de la CGST Act, con citas estatutarias y temperatura baja (0,3) para reducir variabilidad.
- Revision de contratos y clausulas comerciales: analisis de conformidad con la Ley de Sociedades de 2013, FEMA o la Ley de Competencia, adecuado por su entrenamiento sobre derecho corporativo indio y su capacidad de estructurar respuestas por articulos.
- Analisis de jurisprudencia: extraccion de ratio decidendi de sentencias del Tribunal Supremo, tribunales superiores, CESTAT e ITAT, util para despachos que necesitan resumenes estructurados de resoluciones.
- Consultoria en comercio exterior: interpretacion de la Politica de Comercio Exterior 2023, esquema MoOWR y circulares de la CBIC para equipos de importacion/exportacion.
- Formacion interna y soporte a equipos legales: despliegue local con Ollama en estaciones de trabajo con 16-24 GB de VRAM (Q4_K_M) para responder dudas recurrentes sin enviar datos a la nube, relevante por la confidencialidad del material juridico.
- Analisis de derecho penal y probatorio: aplicacion de BNS, BNSS y BSA en la evaluacion preliminar de casos, con la cautela de que requiere validacion por un profesional colegiado.
- Generacion de borradores de opiniones legales: produccion de memorandos con estructura IRAC que un abogado revisa y completa, aprovechando el soporte bilingue ingles-hindi para clientes indios.

## Benchmarks y rendimiento

| Dimension | Puntuacion declarada | Estado |
|---|---|---|
| Recuperacion y precision estatutaria | 100,0% | Cita perfecta (CGST, Aduanas, Impuesto sobre la Renta, BNS/BNSS/BSA) |
| Identificacion de ratio decidendi | 100,0% | Tribunal Supremo, tribunales superiores, CESTAT/ITAT |
| Calidad de razonamiento juridico IRAC | 10,0 / 10 | Asesoria estructurada de grado empresarial |
| Puntuacion compuesta de calidad | 10,0 / 10 | Grado de asesoria empresarial certificado |

Estos resultados proceden exclusivamente de la model card del autor y no se acompanan de la metodologia, el conjunto de evaluacion ni la comparacion con modelos de referencia. No se han publicado resultados independientes de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- Q4_K_M (~15,1 GB): recomendado 16-24 GB de RAM/VRAM. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o A5000 (24 GB). Opcion mas rapida y con menor consumo de memoria.
- Q8_0 (~21,2 GB): recomendado 24-32 GB de RAM/VRAM. Cabe en RTX 4090/3090 con margen ajustado; en A6000 (48 GB) o A100 40 GB sin problema.
- BF16 (~41,8 GB): recomendado 48 GB o mas. Requiere A100 80 GB, H100 o configuracion multi-GPU; tambien viable en cluster de CPU.
- Despliegue: Ollama (incluye Modelfile listo para usar), llama.cpp, LM Studio, llama-cpp-python y vLLM.
- Al ser MoE con ~2,4B de parametros activos, el throughput por token es mas alto que el de un modelo denso de 20B, aunque la memoria necesaria corresponde al total de parametros.
- No se dispone de datos de latencia o throughput medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GPT-OSS 20B Indian Legal (este) | 20,9B totales / ~2,4B activos (MoE) | no disponible | Apache 2.0 | Juridico y fiscal indio |
| GPT-OSS 20B base | 20,9B totales / ~2,4B activos (MoE) | no disponible | Apache 2.0 | Proposito general |
| Modelos legales indios especializados | no disponible | no disponible | variable | Juridico indio |

La informacion disponible no permite establecer comparaciones cuantitativas con alternativas de la misma categoria. No se dispone de datos de rendimiento de modelos legales indios comparables ni de resultados independientes del presente modelo.

## Limitaciones y advertencias
- Los benchmarks declarados (100% de precision estatutaria, 10/10 en IRAC) proceden unicamente del autor y carecen de metodologia publica o validacion independiente; deben tratarse con escepticismo.
- Riesgo de alucinacion en citas de articulos, secciones y sentencias: un modelo juridico puede generar referencias plausibles pero inexistentes. Toda salida requiere verificacion contra el texto legal oficial.
- No se especifica la longitud de contexto, lo que limita la planificacion de casos que requieran documentos extensos.
- Solo soporta ingles y hindi; no se declara cobertura de otras lenguas oficiales de India ni de castellano.
- El ajuste se limita al ordenamiento indio; su uso para otras jurisdicciones producira respuestas no fiables.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la salida del modelo no constituye asesoramiento juridico y su uso en produccion exige supervision por profesionales colegiados y cumplimiento de la normativa local sobre servicios legales.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o robustez.
- El repositorio tiene 361 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y escasa validacion por la comunidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Suvir-Misra/gpt-oss-20b-indian-legal-GGUF
- Modelo base fusionado: https://huggingface.co/Suvir-Misra/gpt-oss-20b-indian-legal-merged
- Contacto del autor: misra.suvir@gmail.com
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
