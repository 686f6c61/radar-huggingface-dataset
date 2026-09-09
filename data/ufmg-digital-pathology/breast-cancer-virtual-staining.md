# ufmg-digital-pathology/breast-cancer-virtual-staining

## Resumen

El modelo `breast-cancer-virtual-staining` es un modelo de inteligencia artificial desarrollado por el grupo de patología digital de la Universidade Federal de Minas Gerais (UFMG). Está diseñado para realizar tinción virtual en muestras histopatológicas de cáncer de mama, una técnica que permite generar imágenes de tinciones histoquímicas a partir de imágenes de microscopía sin teñir o con otras tinciones. El objetivo es reducir el tiempo y el coste asociados a los protocolos convencionales de tinción, que requieren reactivos y procesamiento manual.

No se dispone de información pública sobre la arquitectura, el número de parámetros ni el contexto de entrenamiento del modelo. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia MIT, lo que permite su reutilización comercial y académica. La relevancia de este modelo radica en su potencial para acelerar el flujo de trabajo en diagnóstico anatomopatológico, aunque su validación clínica y su rendimiento concreto no están documentados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo, los datos de entrenamiento ni el proceso de optimización. Por el nombre y el ámbito de aplicación, se trata de un modelo de visión por computador orientado a tareas de imagen a imagen, probablemente basado en arquitecturas generativas, pero no se puede confirmar este extremo. El repositorio contiene exclusivamente la ficha con la licencia MIT y no incluye documentación técnica adicional.

## Capacidades

- Generacion de imagenes de tincion virtual a partir de imagenes histologicas de cancer de mama.
- En el ambito de la tincion virtual, el modelo podria transformar imagenes sin teñir en equivalentes a tinciones clasicas como H&E o inmunohistoquimica, aunque no hay evidencia publica que lo confirme.
- No se han documentado capacidades de generacion de texto, tool calling, soporte de agentes ni razonamiento multi-paso.
- No se han documentado capacidades de vision adicionales ni soporte de audio.

## Casos de uso

- Reduccion del tiempo de tincion en patologia de mama: el modelo podria generar imagenes teñidas digitalmente, eliminando la espera de los protocolos histoquimicos convencionales.
- Ahorro de reactivos y costes de laboratorio: al eliminar la tincion fisica, se reducen los consumibles y el tiempo tecnico en laboratorios de anatomia patologica.
- Estandarizacion de la calidad de imagen: un modelo de tincion virtual podria producir imagenes consistentes, minimizando la variabilidad entre lotes de tincion.
- Asistencia en investigacion oncologica: el modelo podria generar imagenes sinteticas para aumentar la cantidad de datos en estudios de biomarcadores o en el entrenamiento de otros algoritmos.
- Integracion en flujos de trabajo de patologia digital: podria conectarse a sistemas de gestion de imagenes medicas para previsualizar resultados de tincion en tiempo real durante la adquisicion.
- Uso docencia e investigacion: en entornos academicos, permitiria demonstrar transformaciones de tejido sin consumir muestras reales ni reactivos.

Nota: estos casos de uso se basan en las aplicaciones tipicas de la tincion virtual en patologia de mama y no estan directamente documentados para este modelo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos sobre los requisitos de VRAM, GPU recomendada ni opciones de despliegue para este modelo.
- El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo pequeno, pero no es posible estimar la inferencia sin conocer la arquitectura.
- No se ha documentado compatibilidad con frameworks como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos, robustez o precision diagnostica.
- Al ser un modelo de tincion virtual destinado a ambito medico, existe un riesgo elevado de alucinacion morfologica: las imagenes generadas pueden no corresponder a la realidad histologica, lo cual puede inducir errores de diagnostico.
- La licencia MIT permite uso comercial, pero no implica aprobacion regulatoria ni garantia de seguridad como producto sanitario.
- No se ha documentado el soporte para idiomas, ya que es un modelo de vision.
- La ausencia de una model card detallada dificulta la reproducibilidad y la adopcion en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ufmg-digital-pathology/breast-cancer-virtual-staining
- Universidad Federal de Minas Gerais: https://www3.ufmg.br/
- Articulo relacionado con tincion virtual en cancer de mama (Nature): https://www.nature.com/articles/s41523-026-00915-2
- Articulo sobre patologia digital e IA en cancer de mama (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S1756231724002081
